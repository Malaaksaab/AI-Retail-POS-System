import { supabase } from '../lib/supabase';
import type {
  User, Store, Product, Customer, Transaction, TransactionItem,
  Supplier, Category, InventoryTransfer, TransferItem,
  EmployeePerformance, HeldOrder, StockAdjustment, Promotion
} from '../types';

export const db = {
  users: {
    async getAll() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(user: Omit<User, 'id' | 'permissions'>) {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<User>) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: User[]) => void) {
      return supabase
        .channel('users_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  stores: {
    async getAll() {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          store_settings(*),
          hardware_config(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          store_settings(*),
          hardware_config(*)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(store: any) {
      const { settings, hardware, ...storeData } = store;

      const { data: newStore, error: storeError } = await supabase
        .from('stores')
        .insert(storeData)
        .select()
        .single();

      if (storeError) throw storeError;

      if (settings) {
        await supabase.from('store_settings').insert({
          store_id: newStore.id,
          ...settings
        });
      }

      if (hardware) {
        await supabase.from('hardware_config').insert({
          store_id: newStore.id,
          ...hardware
        });
      }

      return newStore;
    },

    async update(id: string, updates: any) {
      const { settings, hardware, ...storeUpdates } = updates;

      const { data, error } = await supabase
        .from('stores')
        .update(storeUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (settings) {
        await supabase
          .from('store_settings')
          .upsert({ store_id: id, ...settings });
      }

      if (hardware) {
        await supabase
          .from('hardware_config')
          .upsert({ store_id: id, ...hardware });
      }

      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: Store[]) => void) {
      return supabase
        .channel('stores_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'stores' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  products: {
    async getAll(storeId?: string) {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(id, name, color),
          suppliers(id, name),
          product_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name, color),
          suppliers(id, name),
          product_variants(*)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async getByBarcode(barcode: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name, color),
          suppliers(id, name)
        `)
        .eq('barcode', barcode)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(product: any) {
      const { variants, ...productData } = product;

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      if (variants && variants.length > 0) {
        const variantsData = variants.map((v: any) => ({
          ...v,
          product_id: newProduct.id
        }));
        await supabase.from('product_variants').insert(variantsData);
      }

      return newProduct;
    },

    async update(id: string, updates: any) {
      const { variants, ...productUpdates } = updates;

      const { data, error } = await supabase
        .from('products')
        .update(productUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (variants) {
        await supabase.from('product_variants').delete().eq('product_id', id);

        if (variants.length > 0) {
          const variantsData = variants.map((v: any) => ({
            ...v,
            product_id: id
          }));
          await supabase.from('product_variants').insert(variantsData);
        }
      }

      return data;
    },

    async updateStock(id: string, quantity: number) {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: quantity })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: Product[]) => void, storeId?: string) {
      return supabase
        .channel('products_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          async () => {
            const data = await this.getAll(storeId);
            callback(data);
          }
        )
        .subscribe();
    }
  },

  categories: {
    async getAll() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },

    async create(category: Omit<Category, 'id'>) {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Category>) {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: any[]) => void) {
      return supabase
        .channel('categories_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  customers: {
    async getAll() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(customer: Omit<Customer, 'id'>) {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Customer>) {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateLoyaltyPoints(id: string, points: number, totalPurchases: number) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          loyalty_points: points,
          total_purchases: totalPurchases,
          last_visit: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: Customer[]) => void) {
      return supabase
        .channel('customers_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'customers' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  transactions: {
    async getAll(storeId?: string, limit?: number) {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customers(id, name, email),
          transaction_items(*)
        `)
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers(id, name, email),
          transaction_items(*)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(transaction: any) {
      const { items, ...transactionData } = transaction;

      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) throw transactionError;

      if (items && items.length > 0) {
        const itemsData = items.map((item: any) => ({
          ...item,
          transaction_id: newTransaction.id
        }));

        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(itemsData);

        if (itemsError) throw itemsError;

        for (const item of items) {
          if (item.productId) {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.productId)
              .single();

            if (product) {
              await supabase
                .from('products')
                .update({ stock: product.stock - item.quantity })
                .eq('id', item.productId);
            }
          }
        }
      }

      return newTransaction;
    },

    async update(id: string, updates: Partial<Transaction>) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: Transaction[]) => void, storeId?: string) {
      return supabase
        .channel('transactions_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'transactions' },
          async () => {
            const data = await this.getAll(storeId);
            callback(data);
          }
        )
        .subscribe();
    }
  },

  suppliers: {
    async getAll() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },

    async create(supplier: Omit<Supplier, 'id'>) {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Supplier>) {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback: (data: Supplier[]) => void) {
      return supabase
        .channel('suppliers_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'suppliers' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  inventoryTransfers: {
    async getAll() {
      const { data, error } = await supabase
        .from('inventory_transfers')
        .select(`
          *,
          from_store:stores!from_store_id(id, name),
          to_store:stores!to_store_id(id, name),
          transfer_items(
            *,
            products(id, name)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async create(transfer: any) {
      const { items, ...transferData } = transfer;

      const { data: newTransfer, error: transferError } = await supabase
        .from('inventory_transfers')
        .insert(transferData)
        .select()
        .single();

      if (transferError) throw transferError;

      if (items && items.length > 0) {
        const itemsData = items.map((item: any) => ({
          ...item,
          transfer_id: newTransfer.id
        }));

        await supabase.from('transfer_items').insert(itemsData);
      }

      return newTransfer;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('inventory_transfers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    subscribe(callback: (data: any[]) => void) {
      return supabase
        .channel('transfers_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'inventory_transfers' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  heldOrders: {
    async getAll(storeId?: string) {
      let query = supabase
        .from('held_orders')
        .select('*')
        .eq('status', 'held')
        .order('held_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async create(order: any) {
      const { data, error } = await supabase
        .from('held_orders')
        .insert(order)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('held_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    subscribe(callback: (data: any[]) => void, storeId?: string) {
      return supabase
        .channel('held_orders_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'held_orders' },
          async () => {
            const data = await this.getAll(storeId);
            callback(data);
          }
        )
        .subscribe();
    }
  },

  promotions: {
    async getAll() {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async getActive() {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);
      if (error) throw error;
      return data;
    },

    async create(promotion: any) {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promotion)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    subscribe(callback: (data: any[]) => void) {
      return supabase
        .channel('promotions_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'promotions' },
          async () => {
            const data = await this.getAll();
            callback(data);
          }
        )
        .subscribe();
    }
  },

  alerts: {
    async getAll(userId?: string) {
      let query = supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async markAsRead(id: string) {
      const { data, error } = await supabase
        .from('system_alerts')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    subscribe(callback: (data: any[]) => void, userId?: string) {
      return supabase
        .channel('alerts_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'system_alerts' },
          async () => {
            const data = await this.getAll(userId);
            callback(data);
          }
        )
        .subscribe();
    }
  }
};
