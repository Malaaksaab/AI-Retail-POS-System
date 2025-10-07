import { User } from '../types';

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ANALYTICS: 'dashboard:analytics',
  
  // POS Terminal
  POS_ACCESS: 'pos:access',
  POS_PROCESS_SALE: 'pos:process_sale',
  POS_REFUND: 'pos:refund',
  POS_VOID: 'pos:void',
  POS_DISCOUNT: 'pos:discount',
  POS_TEMPORARY_BASKET: 'pos:temporary_basket',
  POS_APPROVE_BASKET: 'pos:approve_basket',
  
  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADD: 'inventory:add',
  INVENTORY_EDIT: 'inventory:edit',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',
  
  // Customers
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_ADD: 'customers:add',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',
  CUSTOMERS_LOYALTY: 'customers:loyalty',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_FINANCIAL: 'reports:financial',
  REPORTS_STAFF: 'reports:staff',
  
  // Stores
  STORES_VIEW: 'stores:view',
  STORES_ADD: 'stores:add',
  STORES_EDIT: 'stores:edit',
  STORES_DELETE: 'stores:delete',
  STORES_SETTINGS: 'stores:settings',
  
  // Users
  USERS_VIEW: 'users:view',
  USERS_ADD: 'users:add',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_PERMISSIONS: 'users:permissions',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_SYSTEM: 'settings:system',
  SETTINGS_HARDWARE: 'settings:hardware',
  
  // AI & Analytics (Admin Only)
  AI_INSIGHTS: 'ai:insights',
  AI_PREDICTIONS: 'ai:predictions',
  AI_OPTIMIZATION: 'ai:optimization',
  
  // Enterprise Management (Admin Only)
  ENTERPRISE_DASHBOARD: 'enterprise:dashboard',
  MULTI_STORE_CONTROL: 'multi_store:control',
  SYSTEM_MONITORING: 'system:monitoring',
  PERFORMANCE_ANALYTICS: 'performance:analytics',
  CENTRALIZED_REPORTING: 'reporting:centralized',
  EMPLOYEE_MONITORING: 'employee:monitoring',
  EMPLOYEE_ANALYTICS: 'employee:analytics',
  EMPLOYEE_REPORTS: 'employee:reports',
  
  // Advanced POS Features
  ADVANCED_POS_FEATURES: 'advanced_pos:features',
  ADVANCED_POS_TERMINAL: 'advanced_pos:terminal',
  CRM_ACCESS: 'crm:access',
  CRM_MANAGE: 'crm:manage',
  ECP_MANAGEMENT: 'ecp:management',
  CASH_OUT_SYSTEM: 'cash_out:system',
  SALES_MANAGEMENT: 'sales:management',
  AUTO_INVENTORY: 'auto_inventory:manage',
  CHALLENGES_MANAGE: 'challenges:manage',
  BONUSES_MANAGE: 'bonuses:manage',
  WAGE_MANAGEMENT: 'wage:management',
  ROTA_MANAGEMENT: 'rota:management',
  DUAL_PAYMENT: 'pos:dual_payment',
  HOLD_ORDERS: 'pos:hold_orders',
  GIFT_MANAGEMENT: 'gifts:management',
  ANNIVERSARY_MANAGEMENT: 'anniversary:management',
  
  // Suppliers
  SUPPLIERS_VIEW: 'suppliers:view',
  SUPPLIERS_ADD: 'suppliers:add',
  SUPPLIERS_EDIT: 'suppliers:edit',
  SUPPLIERS_DELETE: 'suppliers:delete',
  
  // Purchase Orders
  PURCHASE_ORDERS_VIEW: 'purchase_orders:view',
  PURCHASE_ORDERS_CREATE: 'purchase_orders:create',
  PURCHASE_ORDERS_APPROVE: 'purchase_orders:approve',
  PURCHASE_ORDERS_RECEIVE: 'purchase_orders:receive',
};

export const ROLE_PERMISSIONS = {
  admin: [
    // Full access to everything
    ...Object.values(PERMISSIONS),
    // Additional admin-only permissions
    PERMISSIONS.AI_INSIGHTS,
    PERMISSIONS.AI_PREDICTIONS,
    PERMISSIONS.AI_OPTIMIZATION,
    PERMISSIONS.ENTERPRISE_DASHBOARD,
    PERMISSIONS.MULTI_STORE_CONTROL,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.SYSTEM_MONITORING,
    PERMISSIONS.PERFORMANCE_ANALYTICS,
    PERMISSIONS.CENTRALIZED_REPORTING,
    PERMISSIONS.EMPLOYEE_MONITORING,
    PERMISSIONS.EMPLOYEE_ANALYTICS,
    PERMISSIONS.EMPLOYEE_REPORTS,
    PERMISSIONS.ADVANCED_POS_FEATURES,
    PERMISSIONS.CHALLENGES_MANAGE,
    PERMISSIONS.BONUSES_MANAGE,
    PERMISSIONS.WAGE_MANAGEMENT,
    PERMISSIONS.ROTA_MANAGEMENT,
    PERMISSIONS.DUAL_PAYMENT,
    PERMISSIONS.HOLD_ORDERS,
    PERMISSIONS.GIFT_MANAGEMENT,
    PERMISSIONS.ANNIVERSARY_MANAGEMENT,
    PERMISSIONS.ADVANCED_POS_TERMINAL,
    PERMISSIONS.CRM_ACCESS,
    PERMISSIONS.CRM_MANAGE,
    PERMISSIONS.ECP_MANAGEMENT,
    PERMISSIONS.CASH_OUT_SYSTEM,
    PERMISSIONS.SALES_MANAGEMENT,
    PERMISSIONS.AUTO_INVENTORY
  ],
  manager: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,
    
    // POS
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_PROCESS_SALE,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_VOID,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.POS_TEMPORARY_BASKET,
    PERMISSIONS.POS_APPROVE_BASKET,
    PERMISSIONS.DUAL_PAYMENT,
    PERMISSIONS.HOLD_ORDERS,
    PERMISSIONS.ADVANCED_POS_TERMINAL,
    PERMISSIONS.CRM_ACCESS,
    PERMISSIONS.ECP_MANAGEMENT,
    PERMISSIONS.CASH_OUT_SYSTEM,
    PERMISSIONS.SALES_MANAGEMENT,
    PERMISSIONS.AUTO_INVENTORY,
    
    // Inventory
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADD,
    PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_TRANSFER,
    
    // Customers
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_ADD,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CUSTOMERS_LOYALTY,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_FINANCIAL,
    
    // Settings (limited)
    PERMISSIONS.SETTINGS_VIEW,
    
    // Suppliers
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_ADD,
    PERMISSIONS.SUPPLIERS_EDIT,
    
    // Purchase Orders
    PERMISSIONS.PURCHASE_ORDERS_VIEW,
    PERMISSIONS.PURCHASE_ORDERS_CREATE,
    PERMISSIONS.PURCHASE_ORDERS_RECEIVE,
  ],
  cashier: [
    // Dashboard (limited)
    PERMISSIONS.DASHBOARD_VIEW,
    
    // POS (core functionality)
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_PROCESS_SALE,
    PERMISSIONS.POS_TEMPORARY_BASKET,
    PERMISSIONS.DUAL_PAYMENT,
    PERMISSIONS.HOLD_ORDERS,
    PERMISSIONS.ADVANCED_POS_TERMINAL,
    PERMISSIONS.CRM_ACCESS,
    PERMISSIONS.ECP_MANAGEMENT,
    PERMISSIONS.CASH_OUT_SYSTEM,
    
    // Customers (basic)
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_ADD,
    PERMISSIONS.CUSTOMERS_LOYALTY,
    
    // Inventory (view only)
    PERMISSIONS.INVENTORY_VIEW,
  ]
};

export const hasPermission = (user: User, permission: string): boolean => {
  if (!user) return false;

  // Check if user has permissions array with actions
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions.some(p => p.actions.includes(permission));
  }

  // Fallback: check role-based permissions directly
  const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
  return rolePermissions.includes(permission);
};

export const canAccess = (user: User, module: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.some(p => p.module === module);
};

export const getUserPermissions = (role: string): string[] => {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
};