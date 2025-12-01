import Dexie, { Table } from 'dexie';

// IndexedDB Schema for Offline-First POS

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  costPrice: number;
  unit: string;
  taxRate: number;
  isActive: boolean;
  quantity?: number; // Local inventory
  lastSynced?: Date;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  storeId: string;
  userId: string;
  shiftId?: string;
  customerId?: string;
  type: 'SALE' | 'RETURN' | 'EXCHANGE';
  items: TransactionItem[];
  payments: Payment[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  status: 'PENDING' | 'COMPLETED';
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  notes?: string;
  createdAt: Date;
  syncedAt?: Date;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Payment {
  method: string;
  amount: number;
  referenceNumber?: string;
  status: string;
}

export interface Customer {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastSynced?: Date;
}

export interface Shift {
  id: string;
  shiftNumber: string;
  storeId: string;
  userId: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  actualCash?: number;
  variance?: number;
  startedAt: Date;
  endedAt?: Date;
  status: 'OPEN' | 'CLOSED';
  totalSales: number;
  totalTransactions: number;
  syncStatus: 'PENDING' | 'SYNCED';
}

export interface SyncQueue {
  id?: number;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  attempts: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  error?: string;
  createdAt: Date;
}

export interface AppSettings {
  id: string;
  storeId: string;
  storeName: string;
  deviceId: string;
  lastSync?: Date;
  offlineMode: boolean;
  autoSync: boolean;
  printerConfig?: any;
}

export class POSDatabase extends Dexie {
  products!: Table<Product, string>;
  transactions!: Table<Transaction, string>;
  customers!: Table<Customer, string>;
  shifts!: Table<Shift, string>;
  syncQueue!: Table<SyncQueue, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('POSDatabase');

    this.version(1).stores({
      products: 'id, sku, barcode, name, categoryId, isActive',
      transactions: 'id, transactionNumber, storeId, shiftId, customerId, syncStatus, createdAt',
      customers: 'id, code, email, phone',
      shifts: 'id, shiftNumber, storeId, userId, status, syncStatus, startedAt',
      syncQueue: '++id, entityType, entityId, status, createdAt',
      settings: 'id, storeId',
    });
  }
}

export const db = new POSDatabase();
