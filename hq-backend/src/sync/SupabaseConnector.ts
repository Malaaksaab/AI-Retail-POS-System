/**
 * =============================================================================
 * SUPABASE STORE CONNECTOR
 * =============================================================================
 * Connector for stores using Supabase backend (like your existing stores)
 * Connects safely via Supabase REST API - never touches DB directly
 * =============================================================================
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BaseConnector,
  ProductData,
  InventoryData,
  SaleData,
  EmployeeData,
  PriceUpdate,
  PromotionPush,
  SyncResult,
  SaleItemData,
} from './BaseConnector';
import { log } from '../utils/logger';

/**
 * Supabase Store Connector
 */
export class SupabaseConnector extends BaseConnector {
  private supabase: SupabaseClient | null = null;
  private serviceKey: string;
  private anonKey: string;
  private url: string;

  constructor(storeId: string, storeName: string, config: any) {
    super(storeId, storeName, config);
    this.url = config.supabaseUrl;
    this.anonKey = config.supabaseAnonKey;
    this.serviceKey = config.supabaseServiceKey;
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  async authenticate(): Promise<void> {
    try {
      // Create Supabase client with service role key (full access)
      this.supabase = createClient(this.url, this.serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // Test connection
      const { error } = await this.supabase.from('stores').select('count').limit(1);
      if (error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }

      this.logSync('authenticate', 'completed');
    } catch (error) {
      this.logSync('authenticate', 'failed', { error });
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.supabase !== null;
  }

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  async fetchProducts(limit: number = 100, offset: number = 0): Promise<ProductData[]> {
    this.ensureAuthenticated();

    try {
      this.logSync('fetchProducts', 'started', { limit, offset });

      const { data, error } = await this.supabase!
        .from('products')
        .select('*')
        .eq('storeId', this.storeId)
        .range(offset, offset + limit - 1)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      const products: ProductData[] = (data || []).map((p) => ({
        externalId: p.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        costPrice: p.cost || p.costPrice || 0,
        sellingPrice: p.price || p.sellingPrice || 0,
        wholesalePrice: p.wholesalePrice,
        trackStock: p.trackStock !== false,
        minStock: p.minStock || 0,
        maxStock: p.maxStock,
        unit: p.unit || 'pcs',
        weight: p.weight,
        imageUrl: p.image || p.imageUrl,
        isActive: p.isActive !== false,
        taxable: p.taxable !== false,
        attributes: p.attributes,
      }));

      this.logSync('fetchProducts', 'completed', { count: products.length });
      return products;
    } catch (error) {
      this.logSync('fetchProducts', 'failed', { error });
      throw error;
    }
  }

  async fetchProductBySku(sku: string): Promise<ProductData | null> {
    this.ensureAuthenticated();

    try {
      const { data, error } = await this.supabase!
        .from('products')
        .select('*')
        .eq('sku', sku)
        .eq('storeId', this.storeId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        externalId: data.id,
        sku: data.sku,
        barcode: data.barcode,
        name: data.name,
        description: data.description,
        category: data.category,
        brand: data.brand,
        costPrice: data.cost || data.costPrice || 0,
        sellingPrice: data.price || data.sellingPrice || 0,
        wholesalePrice: data.wholesalePrice,
        trackStock: data.trackStock !== false,
        minStock: data.minStock || 0,
        maxStock: data.maxStock,
        unit: data.unit || 'pcs',
        weight: data.weight,
        imageUrl: data.image || data.imageUrl,
        isActive: data.isActive !== false,
        taxable: data.taxable !== false,
        attributes: data.attributes,
      };
    } catch (error) {
      log.error(`Error fetching product by SKU: ${sku}`, error);
      return null;
    }
  }

  async fetchInventory(limit: number = 100, offset: number = 0): Promise<InventoryData[]> {
    this.ensureAuthenticated();

    try {
      this.logSync('fetchInventory', 'started', { limit, offset });

      const { data, error } = await this.supabase!
        .from('products')
        .select('id, sku, stock, minStock, maxStock')
        .eq('storeId', this.storeId)
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch inventory: ${error.message}`);
      }

      const inventory: InventoryData[] = (data || []).map((item) => ({
        productId: item.id,
        sku: item.sku,
        quantity: item.stock || 0,
        reservedQty: 0,
      }));

      this.logSync('fetchInventory', 'completed', { count: inventory.length });
      return inventory;
    } catch (error) {
      this.logSync('fetchInventory', 'failed', { error });
      throw error;
    }
  }

  async fetchSales(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
    offset: number = 0
  ): Promise<SaleData[]> {
    this.ensureAuthenticated();

    try {
      this.logSync('fetchSales', 'started', { startDate, endDate, limit, offset });

      const { data, error } = await this.supabase!
        .from('transactions')
        .select(`
          *,
          transaction_items (*)
        `)
        .eq('storeId', this.storeId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .range(offset, offset + limit - 1)
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch sales: ${error.message}`);
      }

      const sales: SaleData[] = (data || []).map((txn) => ({
        externalId: txn.id,
        transactionNo: txn.transactionNo || txn.id,
        saleDate: new Date(txn.date),
        subtotal: txn.subtotal || 0,
        tax: txn.tax || 0,
        discount: txn.discount || 0,
        total: txn.total || 0,
        paymentMethod: txn.paymentMethod || 'cash',
        paymentStatus: txn.status || 'completed',
        customerId: txn.customerId,
        customerName: txn.customerName,
        employeeId: txn.cashierId,
        employeeName: txn.cashierName,
        items: (txn.transaction_items || []).map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount || 0,
          total: item.total,
        })),
      }));

      this.logSync('fetchSales', 'completed', { count: sales.length });
      return sales;
    } catch (error) {
      this.logSync('fetchSales', 'failed', { error });
      throw error;
    }
  }

  async fetchEmployees(limit: number = 100, offset: number = 0): Promise<EmployeeData[]> {
    this.ensureAuthenticated();

    try {
      this.logSync('fetchEmployees', 'started', { limit, offset });

      // Fetch from users table (employees are users with specific roles)
      const { data, error } = await this.supabase!
        .from('users')
        .select('*')
        .eq('storeId', this.storeId)
        .in('role', ['cashier', 'manager'])
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch employees: ${error.message}`);
      }

      const employees: EmployeeData[] = (data || []).map((emp) => ({
        externalId: emp.id,
        employeeCode: emp.employeeCode || emp.email,
        firstName: emp.name?.split(' ')[0] || emp.firstName || 'Unknown',
        lastName: emp.name?.split(' ').slice(1).join(' ') || emp.lastName || '',
        email: emp.email,
        phone: emp.phone || '',
        position: emp.role || 'staff',
        department: emp.department,
        hireDate: new Date(emp.createdAt),
        isActive: emp.isActive !== false,
      }));

      this.logSync('fetchEmployees', 'completed', { count: employees.length });
      return employees;
    } catch (error) {
      this.logSync('fetchEmployees', 'failed', { error });
      throw error;
    }
  }

  // =============================================================================
  // DATA PUSHING
  // =============================================================================

  async pushPriceUpdate(update: PriceUpdate): Promise<boolean> {
    this.ensureAuthenticated();

    try {
      this.logSync('pushPriceUpdate', 'started', { sku: update.sku });

      const { error } = await this.supabase!
        .from('products')
        .update({ price: update.newPrice, updatedAt: new Date().toISOString() })
        .eq('sku', update.sku)
        .eq('storeId', this.storeId);

      if (error) {
        throw new Error(`Failed to push price update: ${error.message}`);
      }

      this.logSync('pushPriceUpdate', 'completed', { sku: update.sku, newPrice: update.newPrice });
      return true;
    } catch (error) {
      this.logSync('pushPriceUpdate', 'failed', { error });
      return false;
    }
  }

  async pushPriceUpdates(updates: PriceUpdate[]): Promise<SyncResult> {
    const results: SyncResult = {
      success: true,
      recordsTotal: updates.length,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
    };

    for (const update of updates) {
      const success = await this.pushPriceUpdate(update);
      if (success) {
        results.recordsSuccess++;
      } else {
        results.recordsFailed++;
        results.errors?.push(`Failed to update price for SKU: ${update.sku}`);
      }
    }

    results.success = results.recordsFailed === 0;
    return results;
  }

  async pushInventoryAdjustment(sku: string, quantityChange: number, reason: string): Promise<boolean> {
    this.ensureAuthenticated();

    try {
      this.logSync('pushInventoryAdjustment', 'started', { sku, quantityChange });

      // First, get current stock
      const { data: product, error: fetchError } = await this.supabase!
        .from('products')
        .select('stock')
        .eq('sku', sku)
        .eq('storeId', this.storeId)
        .single();

      if (fetchError || !product) {
        throw new Error(`Product not found: ${sku}`);
      }

      const newStock = (product.stock || 0) + quantityChange;

      // Update stock
      const { error: updateError } = await this.supabase!
        .from('products')
        .update({ stock: newStock, updatedAt: new Date().toISOString() })
        .eq('sku', sku)
        .eq('storeId', this.storeId);

      if (updateError) {
        throw new Error(`Failed to adjust inventory: ${updateError.message}`);
      }

      // Log stock adjustment
      await this.supabase!.from('stock_adjustments').insert({
        storeId: this.storeId,
        productSku: sku,
        quantityChange,
        reason,
        newStock,
        createdAt: new Date().toISOString(),
      });

      this.logSync('pushInventoryAdjustment', 'completed', { sku, quantityChange, newStock });
      return true;
    } catch (error) {
      this.logSync('pushInventoryAdjustment', 'failed', { error });
      return false;
    }
  }

  async pushPromotion(promotion: PromotionPush): Promise<boolean> {
    this.ensureAuthenticated();

    try {
      this.logSync('pushPromotion', 'started', { promotionName: promotion.name });

      const { error } = await this.supabase!.from('promotions').insert({
        storeId: this.storeId,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        startDate: promotion.startDate.toISOString(),
        endDate: promotion.endDate.toISOString(),
        applicableProducts: promotion.applicableProducts,
        applicableCategories: promotion.applicableCategories,
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to push promotion: ${error.message}`);
      }

      this.logSync('pushPromotion', 'completed', { promotionName: promotion.name });
      return true;
    } catch (error) {
      this.logSync('pushPromotion', 'failed', { error });
      return false;
    }
  }

  // =============================================================================
  // UTILITY
  // =============================================================================

  private ensureAuthenticated() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
  }
}

export default SupabaseConnector;
