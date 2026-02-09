/**
 * =============================================================================
 * ESALETAB STORE CONNECTOR
 * =============================================================================
 * Connector for external eSaletab POS stores
 * Connects via eSaletab's REST API (API endpoint discovery required)
 * =============================================================================
 */

import axios, { AxiosInstance } from 'axios';
import {
  BaseConnector,
  ProductData,
  InventoryData,
  SaleData,
  EmployeeData,
  PriceUpdate,
  PromotionPush,
  SyncResult,
} from './BaseConnector';
import { log } from '../utils/logger';

/**
 * eSaletab Store Connector
 */
export class ESaletabConnector extends BaseConnector {
  private apiClient: AxiosInstance;
  private apiUrl: string;
  private apiKey: string | null = null;
  private username: string;
  private password: string;
  private authToken: string | null = null;

  constructor(storeId: string, storeName: string, config: any) {
    super(storeId, storeName, config);
    this.apiUrl = config.apiUrl;
    this.username = config.username;
    this.password = config.password;

    // Initialize axios client
    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  async authenticate(): Promise<void> {
    try {
      this.logSync('authenticate', 'started');

      // Try to authenticate with eSaletab API
      // Note: Actual endpoint may vary - this is a common pattern
      const response = await this.retryOperation(async () => {
        return await this.apiClient.post('/api/auth/login', {
          username: this.username,
          password: this.password,
        });
      });

      // Extract token from response
      this.authToken = response.data.token || response.data.access_token;

      if (!this.authToken) {
        throw new Error('No auth token received from eSaletab');
      }

      // Set authorization header for future requests
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;

      this.logSync('authenticate', 'completed');
    } catch (error) {
      this.logSync('authenticate', 'failed', { error });
      throw new Error(`eSaletab authentication failed: ${error}`);
    }
  }

  isAuthenticated(): boolean {
    return this.authToken !== null;
  }

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  async fetchProducts(limit: number = 100, offset: number = 0): Promise<ProductData[]> {
    this.ensureAuthenticated();

    try {
      this.logSync('fetchProducts', 'started', { limit, offset });

      const response = await this.retryOperation(async () => {
        return await this.apiClient.get('/api/products', {
          params: { limit, offset },
        });
      });

      const products: ProductData[] = (response.data.products || response.data || []).map((p: any) => ({
        externalId: p.id || p.product_id,
        sku: p.sku || p.code,
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        category: p.category_name || p.category,
        brand: p.brand,
        costPrice: parseFloat(p.cost_price || p.cost || 0),
        sellingPrice: parseFloat(p.selling_price || p.price || 0),
        wholesalePrice: p.wholesale_price ? parseFloat(p.wholesale_price) : undefined,
        trackStock: p.track_stock !== false,
        minStock: parseInt(p.min_stock || p.minimum_stock || 0),
        maxStock: p.max_stock ? parseInt(p.max_stock) : undefined,
        unit: p.unit || 'pcs',
        weight: p.weight ? parseFloat(p.weight) : undefined,
        imageUrl: p.image || p.image_url,
        isActive: p.is_active !== false && p.status !== 'inactive',
        taxable: p.taxable !== false,
        attributes: p.attributes || {},
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
      const response = await this.apiClient.get(`/api/products/sku/${sku}`);
      const p = response.data.product || response.data;

      if (!p) return null;

      return {
        externalId: p.id || p.product_id,
        sku: p.sku || p.code,
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        category: p.category_name || p.category,
        brand: p.brand,
        costPrice: parseFloat(p.cost_price || p.cost || 0),
        sellingPrice: parseFloat(p.selling_price || p.price || 0),
        wholesalePrice: p.wholesale_price ? parseFloat(p.wholesale_price) : undefined,
        trackStock: p.track_stock !== false,
        minStock: parseInt(p.min_stock || 0),
        maxStock: p.max_stock ? parseInt(p.max_stock) : undefined,
        unit: p.unit || 'pcs',
        weight: p.weight ? parseFloat(p.weight) : undefined,
        imageUrl: p.image || p.image_url,
        isActive: p.is_active !== false,
        taxable: p.taxable !== false,
        attributes: p.attributes || {},
      };
    } catch (error) {
      log.error(`Error fetching product by SKU from eSaletab: ${sku}`, error);
      return null;
    }
  }

  async fetchInventory(limit: number = 100, offset: number = 0): Promise<InventoryData[]> {
    this.ensureAuthenticated();

    try {
      this.logSync('fetchInventory', 'started', { limit, offset });

      const response = await this.retryOperation(async () => {
        return await this.apiClient.get('/api/inventory', {
          params: { limit, offset },
        });
      });

      const inventory: InventoryData[] = (response.data.inventory || response.data || []).map((item: any) => ({
        productId: item.product_id || item.id,
        sku: item.sku || item.product_code,
        quantity: parseInt(item.quantity || item.stock || 0),
        reservedQty: parseInt(item.reserved || 0),
        lastStockCount: item.last_stock_count ? new Date(item.last_stock_count) : undefined,
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

      const response = await this.retryOperation(async () => {
        return await this.apiClient.get('/api/sales', {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            limit,
            offset,
          },
        });
      });

      const sales: SaleData[] = (response.data.sales || response.data || []).map((sale: any) => ({
        externalId: sale.id || sale.sale_id,
        transactionNo: sale.transaction_no || sale.invoice_no || sale.id,
        saleDate: new Date(sale.sale_date || sale.date || sale.created_at),
        subtotal: parseFloat(sale.subtotal || 0),
        tax: parseFloat(sale.tax || 0),
        discount: parseFloat(sale.discount || 0),
        total: parseFloat(sale.total || sale.grand_total || 0),
        paymentMethod: sale.payment_method || 'cash',
        paymentStatus: sale.payment_status || 'completed',
        customerId: sale.customer_id,
        customerName: sale.customer_name,
        employeeId: sale.employee_id || sale.cashier_id,
        employeeName: sale.employee_name || sale.cashier_name,
        items: (sale.items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name || item.name,
          sku: item.sku || item.product_code,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unit_price || item.price),
          discount: parseFloat(item.discount || 0),
          total: parseFloat(item.total || item.line_total),
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

      const response = await this.retryOperation(async () => {
        return await this.apiClient.get('/api/employees', {
          params: { limit, offset },
        });
      });

      const employees: EmployeeData[] = (response.data.employees || response.data || []).map((emp: any) => ({
        externalId: emp.id || emp.employee_id,
        employeeCode: emp.employee_code || emp.code,
        firstName: emp.first_name || emp.name?.split(' ')[0] || 'Unknown',
        lastName: emp.last_name || emp.name?.split(' ').slice(1).join(' ') || '',
        email: emp.email,
        phone: emp.phone || '',
        position: emp.position || emp.role,
        department: emp.department,
        hireDate: new Date(emp.hire_date || emp.join_date || emp.created_at),
        terminationDate: emp.termination_date ? new Date(emp.termination_date) : undefined,
        hourlyRate: emp.hourly_rate ? parseFloat(emp.hourly_rate) : undefined,
        salary: emp.salary ? parseFloat(emp.salary) : undefined,
        isActive: emp.is_active !== false && emp.status !== 'inactive',
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

      await this.retryOperation(async () => {
        return await this.apiClient.put(`/api/products/sku/${update.sku}/price`, {
          price: update.newPrice,
          effective_date: update.effectiveDate?.toISOString(),
        });
      });

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

      await this.retryOperation(async () => {
        return await this.apiClient.post(`/api/inventory/adjust`, {
          sku,
          quantity_change: quantityChange,
          reason,
        });
      });

      this.logSync('pushInventoryAdjustment', 'completed', { sku, quantityChange });
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

      await this.retryOperation(async () => {
        return await this.apiClient.post(`/api/promotions`, {
          name: promotion.name,
          description: promotion.description,
          type: promotion.type,
          value: promotion.value,
          start_date: promotion.startDate.toISOString(),
          end_date: promotion.endDate.toISOString(),
          applicable_products: promotion.applicableProducts,
          applicable_categories: promotion.applicableCategories,
        });
      });

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

export default ESaletabConnector;
