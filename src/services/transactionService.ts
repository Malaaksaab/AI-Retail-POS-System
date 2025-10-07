import { supabase } from '../lib/supabase';
import { Transaction, TransactionItem } from '../types';
import { customerService } from './customerService';
import { productService } from './productService';

export const transactionService = {
  async getAllTransactions(storeId?: string, status?: string) {
    let query = supabase
      .from('transactions')
      .select('*, transaction_items(*, products(*)), customers(*), users!cashier_id(*)')
      .order('transaction_date', { ascending: false });

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getTransactionById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*, products(*)), customers(*), users!cashier_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Partial<Transaction>, items: TransactionItem[]) {
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    const { data: newTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        receipt_number: receiptNumber,
        store_id: transaction.storeId,
        cashier_id: transaction.cashierId,
        customer_id: transaction.customerId,
        status: transaction.status || 'completed',
        basket_type: transaction.basketType || 'permanent',
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        discount: transaction.discount || 0,
        total: transaction.total,
        payment_method: transaction.paymentMethod,
        cash_amount: transaction.paymentMethod === 'cash' || transaction.paymentMethod === 'dual' ? transaction.cash_amount : 0,
        card_amount: transaction.paymentMethod === 'card' || transaction.paymentMethod === 'dual' ? transaction.card_amount : 0,
        change_given: transaction.change || 0,
        loyalty_points_earned: transaction.loyaltyPointsEarned || 0,
        loyalty_points_used: transaction.loyaltyPointsUsed || 0,
        reason: transaction.reason,
        notes: transaction.notes,
        transaction_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    const transactionItems = items.map(item => ({
      transaction_id: newTransaction.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      tax_amount: item.taxAmount || 0,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) throw itemsError;

    if (transaction.status === 'completed') {
      for (const item of items) {
        const product = await productService.getProductById(item.productId);
        if (product && product.track_stock) {
          const newStock = product.stock - item.quantity;
          await productService.updateStock(
            item.productId,
            newStock,
            `Sale - Transaction ${receiptNumber}`,
            transaction.cashierId!,
            transaction.storeId!
          );
        }
      }

      if (transaction.customerId) {
        await customerService.updateLastVisit(transaction.customerId);
        await customerService.updateTotalPurchases(transaction.customerId, transaction.total!);

        if (transaction.loyaltyPointsEarned && transaction.loyaltyPointsEarned > 0) {
          await customerService.updateLoyaltyPoints(
            transaction.customerId,
            transaction.loyaltyPointsEarned,
            newTransaction.id,
            'Points earned from purchase'
          );
        }

        if (transaction.loyaltyPointsUsed && transaction.loyaltyPointsUsed > 0) {
          await customerService.updateLoyaltyPoints(
            transaction.customerId,
            -transaction.loyaltyPointsUsed,
            newTransaction.id,
            'Points redeemed'
          );
        }

        await customerService.updateCustomerTier(transaction.customerId);
      }
    }

    return newTransaction;
  },

  async updateTransactionStatus(id: string, status: string, approvedBy?: string) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        approved_by: approvedBy,
        approved_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (status === 'completed') {
      const transaction = await this.getTransactionById(id);
      if (transaction && transaction.transaction_items) {
        for (const item of transaction.transaction_items) {
          const product = await productService.getProductById(item.product_id);
          if (product && product.track_stock) {
            const newStock = product.stock - item.quantity;
            await productService.updateStock(
              item.product_id,
              newStock,
              `Approved transaction ${transaction.receipt_number}`,
              approvedBy!,
              transaction.store_id
            );
          }
        }
      }
    }

    return data;
  },

  async refundTransaction(id: string, userId: string, reason: string) {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error('Transaction not found');

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: 'refunded',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        notes: `Refunded: ${reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (transaction.transaction_items) {
      for (const item of transaction.transaction_items) {
        const product = await productService.getProductById(item.product_id);
        if (product && product.track_stock) {
          const newStock = product.stock + item.quantity;
          await productService.updateStock(
            item.product_id,
            newStock,
            `Refund - Transaction ${transaction.receipt_number}`,
            userId,
            transaction.store_id
          );
        }
      }
    }

    if (transaction.customer_id) {
      await customerService.updateTotalPurchases(transaction.customer_id, -transaction.total);

      if (transaction.loyalty_points_earned > 0) {
        await customerService.updateLoyaltyPoints(
          transaction.customer_id,
          -transaction.loyalty_points_earned,
          id,
          'Points reversed due to refund'
        );
      }

      if (transaction.loyalty_points_used > 0) {
        await customerService.updateLoyaltyPoints(
          transaction.customer_id,
          transaction.loyalty_points_used,
          id,
          'Points refunded'
        );
      }

      await customerService.updateCustomerTier(transaction.customer_id);
    }

    return data;
  },

  async getTransactionsByDateRange(storeId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*), customers(*)')
      .eq('store_id', storeId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTransactionsByCashier(cashierId: string, date?: string) {
    let query = supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .eq('cashier_id', cashierId)
      .order('transaction_date', { ascending: false });

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('transaction_date', startOfDay.toISOString())
        .lte('transaction_date', endOfDay.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getTransactionStats(storeId?: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (startDate && endDate) {
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const transactions = data || [];

    return {
      totalTransactions: transactions.length,
      totalSales: transactions.reduce((sum, t) => sum + (t.total || 0), 0),
      averageTransaction: transactions.length > 0
        ? transactions.reduce((sum, t) => sum + (t.total || 0), 0) / transactions.length
        : 0,
      cashSales: transactions.filter(t => t.payment_method === 'cash').length,
      cardSales: transactions.filter(t => t.payment_method === 'card').length,
    };
  }
};
