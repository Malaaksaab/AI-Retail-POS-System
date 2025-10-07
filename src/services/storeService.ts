import { supabase } from '../lib/supabase';
import { Store } from '../types';

export const storeService = {
  async getAllStores() {
    const { data, error } = await supabase
      .from('stores')
      .select('*, store_settings(*), hardware_config(*), users!manager_id(*)')
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getStoreById(id: string) {
    const { data, error } = await supabase
      .from('stores')
      .select('*, store_settings(*), hardware_config(*), users!manager_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createStore(store: Partial<Store>) {
    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: store.name,
        address: store.address,
        phone: store.phone,
        email: store.email,
        status: 'active',
        manager_id: store.manager,
      })
      .select()
      .single();

    if (storeError) throw storeError;

    if (store.settings) {
      await supabase
        .from('store_settings')
        .insert({
          store_id: newStore.id,
          currency: store.settings.currency || 'GBP',
          currency_symbol: store.settings.currencySymbol || '£',
          tax_rate: store.settings.taxRate || 20,
          receipt_footer: store.settings.receiptFooter,
          loyalty_enabled: store.settings.loyaltyEnabled !== false,
          offline_mode: store.settings.offlineMode || false,
        });
    }

    if (store.hardware) {
      await supabase
        .from('hardware_config')
        .insert({
          store_id: newStore.id,
          barcode_scanner: store.hardware.barcodeScanner,
          printer: store.hardware.printer,
          cash_drawer: store.hardware.cashDrawer,
          card_reader: store.hardware.cardReader,
          display: store.hardware.display,
        });
    }

    return newStore;
  },

  async updateStore(id: string, updates: Partial<Store>) {
    const { data, error } = await supabase
      .from('stores')
      .update({
        name: updates.name,
        address: updates.address,
        phone: updates.phone,
        email: updates.email,
        status: updates.status,
        manager_id: updates.manager,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (updates.settings) {
      await supabase
        .from('store_settings')
        .upsert({
          store_id: id,
          currency: updates.settings.currency,
          currency_symbol: updates.settings.currencySymbol,
          tax_rate: updates.settings.taxRate,
          receipt_footer: updates.settings.receiptFooter,
          loyalty_enabled: updates.settings.loyaltyEnabled,
          offline_mode: updates.settings.offlineMode,
          updated_at: new Date().toISOString(),
        });
    }

    return data;
  },

  async updateHardwareConfig(storeId: string, hardware: any) {
    const { data, error } = await supabase
      .from('hardware_config')
      .upsert({
        store_id: storeId,
        barcode_scanner: hardware.barcodeScanner,
        printer: hardware.printer,
        cash_drawer: hardware.cashDrawer,
        card_reader: hardware.cardReader,
        display: hardware.display,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStoreStats(storeId: string, startDate?: string, endDate?: string) {
    let transactionQuery = supabase
      .from('transactions')
      .select('*')
      .eq('store_id', storeId)
      .eq('status', 'completed');

    if (startDate && endDate) {
      transactionQuery = transactionQuery
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
    }

    const { data: transactions } = await transactionQuery;

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true);

    const totalSales = (transactions || []).reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = (transactions || []).length;
    const lowStockCount = (products || []).filter(p => p.stock <= p.min_stock).length;
    const totalProducts = (products || []).length;

    return {
      totalSales,
      totalTransactions,
      lowStockCount,
      totalProducts,
      averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
    };
  }
};
