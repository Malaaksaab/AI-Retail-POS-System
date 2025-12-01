/**
 * =============================================================================
 * BASE STORE CONNECTOR
 * =============================================================================
 * Abstract base class for store connectors
 * All store type connectors (Supabase, eSaletab, Custom) extend this
 * =============================================================================
 */

import { log } from '../utils/logger';

/**
 * Product data interface (normalized across all store types)
 */
export interface ProductData {
  externalId: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  trackStock: boolean;
  minStock: number;
  maxStock?: number;
  unit: string;
  weight?: number;
  imageUrl?: string;
  isActive: boolean;
  taxable: boolean;
  attributes?: any;
}

/**
 * Inventory data interface
 */
export interface InventoryData {
  productId: string;
  sku: string;
  quantity: number;
  reservedQty?: number;
  lastStockCount?: Date;
  lastRestocked?: Date;
}

/**
 * Sale data interface
 */
export interface SaleData {
  externalId: string;
  transactionNo: string;
  saleDate: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  employeeId?: string;
  employeeName?: string;
  items: SaleItemData[];
}

/**
 * Sale item data interface
 */
export interface SaleItemData {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

/**
 * Employee data interface
 */
export interface EmployeeData {
  externalId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  position: string;
  department?: string;
  hireDate: Date;
  terminationDate?: Date;
  hourlyRate?: number;
  salary?: number;
  isActive: boolean;
}

/**
 * Sync result interface
 */
export interface SyncResult {
  success: boolean;
  recordsTotal: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors?: string[];
  metadata?: any;
}

/**
 * Price update interface
 */
export interface PriceUpdate {
  sku: string;
  newPrice: number;
  effectiveDate?: Date;
}

/**
 * Promotion push interface
 */
export interface PromotionPush {
  name: string;
  description?: string;
  type: string;
  value: number;
  startDate: Date;
  endDate: Date;
  applicableProducts: string[]; // SKUs
  applicableCategories: string[];
}

/**
 * Abstract Base Connector Class
 */
export abstract class BaseConnector {
  protected storeId: string;
  protected storeName: string;
  protected config: any;

  constructor(storeId: string, storeName: string, config: any) {
    this.storeId = storeId;
    this.storeName = storeName;
    this.config = config;
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  /**
   * Authenticate with the store system
   * Must be implemented by each connector
   */
  abstract authenticate(): Promise<void>;

  /**
   * Check if authentication is valid
   */
  abstract isAuthenticated(): boolean;

  // =============================================================================
  // DATA FETCHING (PULL FROM STORE)
  // =============================================================================

  /**
   * Fetch all products from store
   */
  abstract fetchProducts(limit?: number, offset?: number): Promise<ProductData[]>;

  /**
   * Fetch product by SKU
   */
  abstract fetchProductBySku(sku: string): Promise<ProductData | null>;

  /**
   * Fetch inventory data
   */
  abstract fetchInventory(limit?: number, offset?: number): Promise<InventoryData[]>;

  /**
   * Fetch sales transactions
   */
  abstract fetchSales(startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<SaleData[]>;

  /**
   * Fetch employees
   */
  abstract fetchEmployees(limit?: number, offset?: number): Promise<EmployeeData[]>;

  // =============================================================================
  // DATA PUSHING (PUSH TO STORE)
  // =============================================================================

  /**
   * Push price update to store
   */
  abstract pushPriceUpdate(update: PriceUpdate): Promise<boolean>;

  /**
   * Push multiple price updates
   */
  abstract pushPriceUpdates(updates: PriceUpdate[]): Promise<SyncResult>;

  /**
   * Push inventory transfer (adjust stock)
   */
  abstract pushInventoryAdjustment(sku: string, quantityChange: number, reason: string): Promise<boolean>;

  /**
   * Push promotion to store
   */
  abstract pushPromotion(promotion: PromotionPush): Promise<boolean>;

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Test connection to store
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      log.info(`Connection test successful for store: ${this.storeName}`, {
        storeId: this.storeId,
      });
      return true;
    } catch (error) {
      log.error(`Connection test failed for store: ${this.storeName}`, error, {
        storeId: this.storeId,
      });
      return false;
    }
  }

  /**
   * Get store info
   */
  getStoreInfo() {
    return {
      storeId: this.storeId,
      storeName: this.storeName,
      type: this.constructor.name,
    };
  }

  /**
   * Handle API errors with retry logic
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        log.warn(`Operation failed (attempt ${attempt}/${maxRetries})`, {
          storeId: this.storeId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (attempt < maxRetries) {
          await this.delay(delayMs * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Delay helper
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log sync operation
   */
  protected logSync(operation: string, status: 'started' | 'completed' | 'failed', meta?: any) {
    log.sync(this.storeId, operation, status, {
      storeName: this.storeName,
      ...meta,
    });
  }
}

export default BaseConnector;
