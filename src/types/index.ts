export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  storeId?: string;
  avatar?: string;
  permissions: Permission[];
  lastLogin?: string;
  isActive: boolean;
  aiAccess?: boolean;
  systemLevel?: 'store' | 'regional' | 'corporate';
}

export interface Permission {
  module: string;
  actions: string[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  manager: string;
  settings: StoreSettings;
  hardware: HardwareConfig;
}

export interface StoreSettings {
  currency: string;
  currencySymbol: string;
  taxRate: number;
  receiptFooter: string;
  loyaltyEnabled: boolean;
  offlineMode: boolean;
}

export interface HardwareConfig {
  barcodeScanner: {
    enabled: boolean;
    type: 'usb' | 'bluetooth' | 'integrated';
    model: string;
  };
  printer: {
    enabled: boolean;
    type: 'thermal' | 'inkjet' | 'laser';
    model: string;
    paperSize: string;
  };
  cashDrawer: {
    enabled: boolean;
    type: 'rj11' | 'usb';
    model: string;
  };
  cardReader: {
    enabled: boolean;
    type: 'chip' | 'contactless' | 'magnetic';
    model: string;
  };
  display: {
    customerDisplay: boolean;
    touchScreen: boolean;
    size: string;
  };
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  subcategory?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  description: string;
  variants?: ProductVariant[];
  image?: string;
  storeId: string;
  supplier?: string;
  location?: string;
  isActive: boolean;
  taxable: boolean;
  trackStock: boolean;
  sellByWeight: boolean;
  ageRestricted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock: number;
  barcode?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  totalPurchases: number;
  registrationDate: string;
  lastVisit?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  notes?: string;
  isActive: boolean;
}

export interface AIInsight {
  id: string;
  type: 'sales_prediction' | 'inventory_optimization' | 'customer_behavior' | 'performance_alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: string[];
  data: any;
  createdAt: string;
  storeId?: string;
}

export interface InventoryTransfer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  fromStoreName: string;
  toStoreName: string;
  items: TransferItem[];
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
  requestDate: string;
  approvedDate?: string;
  completedDate?: string;
  notes?: string;
  totalValue: number;
}

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId?: string;
  storeId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'inventory' | 'sales' | 'security' | 'performance';
  actionRequired: boolean;
  autoResolve: boolean;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  dailySales: number;
  monthlySales: number;
  yearlyGrowth: number;
  customerCount: number;
  averageTransaction: number;
  inventoryTurnover: number;
  profitMargin: number;
  staffCount: number;
  performanceScore: number;
  ranking: number;
}
export interface Transaction {
  id: string;
  date: string;
  customerId?: string;
  customerName?: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'gift_card' | 'loyalty_points';
  status: 'completed' | 'refunded' | 'on_hold' | 'temporary' | 'pending_approval' | 'voided';
  cashierId: string;
  cashierName: string;
  storeId: string;
  basketType: 'temporary' | 'permanent';
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
  receiptNumber: string;
  change?: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsUsed?: number;
  notes?: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
  discount?: number;
  taxAmount?: number;
  variant?: string;
}

export interface TemporaryBasket extends Transaction {
  reason: string;
  requiresApproval: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'customers' | 'financial' | 'staff' | 'tax';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedBy: string;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'csv';
  filters: ReportFilters;
}

export interface ReportFilters {
  storeId?: string;
  categoryId?: string;
  customerId?: string;
  cashierId?: string;
  paymentMethod?: string;
  status?: string;
}

export interface Settings {
  currency: string;
  currencySymbol: string;
  taxRate: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    sidebarColor: string;
    customBackground?: string;
  };
  notifications: {
    lowStock: boolean;
    newOrders: boolean;
    systemAlerts: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    requirePasswordForRefunds: boolean;
    requirePasswordForVoids: boolean;
    enableAuditTrail: boolean;
    twoFactorAuth: boolean;
  };
  hardware: HardwareConfig;
  receipt: {
    header: string;
    footer: string;
    showLogo: boolean;
    showBarcode: boolean;
    paperSize: 'thermal_58mm' | 'thermal_80mm' | 'a4';
  };
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  isActive: boolean;
  products: string[];
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'received' | 'partial' | 'cancelled';
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  createdBy: string;
  storeId: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  total: number;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
  storeId: string;
  cost?: number;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle';
  value: number;
  conditions: PromotionCondition[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
}

export interface PromotionCondition {
  type: 'minimum_quantity' | 'minimum_amount' | 'customer_tier' | 'day_of_week';
  value: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: any;
  timestamp: string;
  ipAddress: string;
  storeId: string;
}

export interface EmployeePerformance {
  id: string;
  employeeId: string;
  employeeName: string;
  role: 'admin' | 'manager' | 'cashier';
  storeId: string;
  storeName: string;
  dailyStats: {
    date: string;
    transactionsProcessed: number;
    totalSales: number;
    averageTransactionValue: number;
    customersServed: number;
    hoursWorked: number;
    efficiency: number;
    accuracy: number;
  };
  weeklyStats: {
    weekStart: string;
    weekEnd: string;
    totalTransactions: number;
    totalSales: number;
    totalHours: number;
    averageEfficiency: number;
    customerSatisfaction: number;
    goalsAchieved: number;
  };
  monthlyStats: {
    month: string;
    year: number;
    totalTransactions: number;
    totalSales: number;
    totalHours: number;
    performanceScore: number;
    ranking: number;
    bonusEarned: number;
    trainingCompleted: number;
  };
  lastActive: string;
  status: 'active' | 'inactive' | 'on_break' | 'offline';
  profileImage?: string;
  joinDate: string;
  department: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface EmployeeAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'performance' | 'attendance' | 'training' | 'goal' | 'violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
  actionRequired: boolean;
  storeId: string;
}

export interface EmployeeGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  progress: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: string[];
  winner?: string;
  prize: number;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
}

export interface EmployeeBonus {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'performance' | 'sales' | 'customer_service' | 'attendance' | 'challenge';
  amount: number;
  reason: string;
  period: string;
  dateAwarded: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface EmployeeOfMonth {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  achievements: string[];
  totalSales: number;
  customerRating: number;
  bonusAmount: number;
  photo?: string;
}

export interface WinningProduct {
  id: string;
  productId: string;
  productName: string;
  category: string;
  totalSales: number;
  unitssold: number;
  revenue: number;
  period: string;
  ranking: number;
  growthRate: number;
}

export interface TopOffer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  startDate: string;
  endDate: string;
  applicableProducts: string[];
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  priority: number;
}

export interface CustomerAnniversary {
  id: string;
  customerId: string;
  customerName: string;
  anniversaryType: 'registration' | 'birthday' | 'first_purchase';
  date: string;
  yearsCompleted: number;
  giftOffered: string;
  giftValue: number;
  isRedeemed: boolean;
  redeemedDate?: string;
}

export interface GiftManagement {
  id: string;
  name: string;
  description: string;
  type: 'product' | 'discount' | 'loyalty_points' | 'voucher';
  value: number;
  cost: number;
  eligibilityCriteria: string;
  validityDays: number;
  isActive: boolean;
  stockQuantity?: number;
  usageCount: number;
}

export interface DualPayment {
  id: string;
  transactionId: string;
  cashAmount: number;
  cardAmount: number;
  totalAmount: number;
  cashReceived: number;
  changeGiven: number;
  cardTransactionId?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface WageManagement {
  id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  hourlyRate: number;
  overtimeRate: number;
  hoursWorked: number;
  overtimeHours: number;
  bonuses: number;
  deductions: number;
  totalWage: number;
  payPeriod: string;
  payDate: string;
  status: 'calculated' | 'approved' | 'paid';
}

export interface RotaSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  breakStart?: string;
  breakEnd?: string;
  role: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
  notes?: string;
}

export interface HeldOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashierId: string;
  cashierName: string;
  heldAt: string;
  reason: string;
  status: 'held' | 'resumed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

export interface StoreTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  fromStoreId: string;
  toStoreId: string;
  fromStoreName: string;
  toStoreName: string;
  transferDate: string;
  duration: 'temporary' | 'permanent';
  reason: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export interface CRMCustomer extends Customer {
  purchaseHistory: Transaction[];
  preferences: CustomerPreference[];
  communicationHistory: CommunicationRecord[];
  segments: string[];
  lifetime_value: number;
  acquisition_date: string;
  last_interaction: string;
  risk_score: number;
  satisfaction_score: number;
  referrals: number;
}

export interface CustomerPreference {
  id: string;
  customerId: string;
  category: string;
  preference: string;
  strength: number;
  lastUpdated: string;
}

export interface CommunicationRecord {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'call' | 'in_store';
  subject: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'responded';
  employeeId: string;
}

export interface ECPManagement {
  id: string;
  customerId: string;
  customerName: string;
  points_earned: number;
  points_redeemed: number;
  points_balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tier_benefits: string[];
  next_tier_requirement: number;
  expiry_date?: string;
  transactions: ECPTransaction[];
}

export interface ECPTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  transaction_id?: string;
  timestamp: string;
  expiry_date?: string;
}

export interface CashOutSession {
  id: string;
  cashierId: string;
  cashierName: string;
  storeId: string;
  storeName: string;
  sessionStart: string;
  sessionEnd?: string;
  openingCash: number;
  closingCash: number;
  expectedCash: number;
  variance: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  refunds: number;
  voids: number;
  discounts: number;
  transactions: string[];
  status: 'active' | 'pending_review' | 'completed' | 'discrepancy';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AdvancedSearchFilter {
  categories: string[];
  priceRange: { min: number; max: number };
  stockRange: { min: number; max: number };
  suppliers: string[];
  stores: string[];
  dateRange: { start: string; end: string };
  status: string[];
  tags: string[];
  customFields: { [key: string]: any };
}

export interface SalesManagement {
  id: string;
  type: 'target' | 'quota' | 'commission' | 'incentive';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  applicableStores: string[];
  applicableEmployees: string[];
  rewards: SalesReward[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
}

export interface SalesReward {
  threshold: number;
  reward_type: 'cash' | 'percentage' | 'points' | 'gift';
  reward_value: number;
  description: string;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  adjustmentType: 'auto_reorder' | 'transfer_in' | 'transfer_out' | 'damage' | 'theft' | 'correction';
  quantityBefore: number;
  quantityAfter: number;
  quantityChanged: number;
  reason: string;
  triggeredBy: 'system' | 'user' | 'supplier';
  timestamp: string;
  cost_impact: number;
  approved_by?: string;
  status: 'pending' | 'approved' | 'completed';
}

export interface AutoInventoryRule {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  reorderPoint: number;
  reorderQuantity: number;
  maxStock: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  isActive: boolean;
  lastTriggered?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface HardwareStatus {
  device: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  lastChecked: string;
  errorMessage?: string;
}