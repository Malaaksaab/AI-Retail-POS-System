import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Store,
  UserCheck,
  Settings,
  Truck,
  ShoppingBag,
  CreditCard,
  FileText,
  AlertTriangle,
  Gift,
  Tag,
  Zap,
  Database,
  HardDrive,
  Wifi,
  Palette,
  ArrowRightLeft,
  Activity,
  Receipt,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { User } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface SidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  theme?: any;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    permission: PERMISSIONS.DASHBOARD_VIEW,
    category: 'main'
  },
  { 
    id: 'pos', 
    label: 'POS Terminal', 
    icon: ShoppingCart, 
    permission: PERMISSIONS.POS_ACCESS,
    category: 'main'
  },
  { 
    id: 'advanced-pos', 
    label: 'Advanced POS', 
    icon: Zap, 
    permission: PERMISSIONS.ADVANCED_POS_TERMINAL,
    category: 'main'
  },
  
  // Catalog Section
  { 
    id: 'catalog', 
    label: 'Catalog', 
    icon: Package, 
    permission: PERMISSIONS.INVENTORY_VIEW,
    category: 'catalog',
    isHeader: true
  },
  { 
    id: 'inventory', 
    label: 'Products', 
    icon: Package, 
    permission: PERMISSIONS.INVENTORY_VIEW,
    category: 'catalog'
  },
  { 
    id: 'suppliers', 
    label: 'Suppliers', 
    icon: Truck, 
    permission: PERMISSIONS.SUPPLIERS_VIEW,
    category: 'catalog'
  },
  { 
    id: 'inventory-transfer', 
    label: 'Inventory Transfer', 
    icon: ArrowRightLeft, 
    permission: PERMISSIONS.INVENTORY_TRANSFER,
    category: 'catalog'
  },
  { 
    id: 'categories', 
    label: 'Categories', 
    icon: Tag, 
    permission: PERMISSIONS.INVENTORY_VIEW,
    category: 'catalog'
  },
  
  // Sales Section
  { 
    id: 'sales', 
    label: 'Sales', 
    icon: ShoppingBag, 
    permission: PERMISSIONS.REPORTS_VIEW,
    category: 'sales',
    isHeader: true
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: CreditCard,
    permission: PERMISSIONS.REPORTS_VIEW,
    category: 'sales'
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: Receipt,
    permission: PERMISSIONS.REPORTS_VIEW,
    category: 'sales'
  },
  {
    id: 'payments',
    label: 'Payment Tracking',
    icon: DollarSign,
    permission: PERMISSIONS.REPORTS_VIEW,
    category: 'sales'
  },
  {
    id: 'financial-reports',
    label: 'Financial Reports',
    icon: TrendingUp,
    permission: PERMISSIONS.REPORTS_FINANCIAL,
    category: 'sales'
  },
  { 
    id: 'returns', 
    label: 'Returns & Refunds', 
    icon: FileText, 
    permission: PERMISSIONS.POS_REFUND,
    category: 'sales'
  },
  
  // Customers Section
  { 
    id: 'customers', 
    label: 'Customers', 
    icon: Users, 
    permission: PERMISSIONS.CUSTOMERS_VIEW,
    category: 'customers'
  },
  
  // Promotions Section
  { 
    id: 'promotions', 
    label: 'Promotions', 
    icon: Gift, 
    permission: PERMISSIONS.INVENTORY_VIEW,
    category: 'promotions',
    isHeader: true
  },
  { 
    id: 'discounts', 
    label: 'Discounts', 
    icon: Tag, 
    permission: PERMISSIONS.POS_DISCOUNT,
    category: 'promotions'
  },
  { 
    id: 'loyalty', 
    label: 'Loyalty Program', 
    icon: Gift, 
    permission: PERMISSIONS.CUSTOMERS_LOYALTY,
    category: 'promotions'
  },
  
  // Reports Section
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: BarChart3, 
    permission: PERMISSIONS.REPORTS_VIEW,
    category: 'reports'
  },
  
  // Management Section (Admin/Manager only)
  { 
    id: 'stores', 
    label: 'Stores', 
    icon: Store, 
    permission: PERMISSIONS.STORES_VIEW,
    category: 'management'
  },
  { 
    id: 'users', 
    label: 'Users', 
    icon: UserCheck, 
    permission: PERMISSIONS.USERS_VIEW,
    category: 'management'
  },
  { 
    id: 'employee-monitoring', 
    label: 'Employee Monitoring', 
    icon: Activity, 
    permission: PERMISSIONS.EMPLOYEE_MONITORING,
    category: 'management'
  },
  { 
    id: 'advanced-features', 
    label: 'Advanced Features', 
    icon: Zap, 
    permission: PERMISSIONS.ADVANCED_POS_FEATURES,
    category: 'management'
  },
  
  // System Section
  { 
    id: 'system', 
    label: 'System', 
    icon: Settings, 
    permission: PERMISSIONS.SETTINGS_VIEW,
    category: 'system',
    isHeader: true
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    permission: PERMISSIONS.SETTINGS_VIEW,
    category: 'system'
  },
  { 
    id: 'theme-customizer', 
    label: 'Theme Customizer', 
    icon: Palette, 
    permission: PERMISSIONS.SETTINGS_VIEW,
    category: 'system'
  },
  { 
    id: 'hardware', 
    label: 'Hardware', 
    icon: HardDrive, 
    permission: PERMISSIONS.SETTINGS_HARDWARE,
    category: 'system'
  },
  { 
    id: 'alerts', 
    label: 'System Alerts', 
    icon: AlertTriangle, 
    permission: PERMISSIONS.SETTINGS_VIEW,
    category: 'system'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onViewChange, theme }) => {
  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(user, item.permission)
  );

  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const renderMenuSection = (category: string, items: typeof menuItems) => {
    const headerItem = items.find(item => item.isHeader);
    const regularItems = items.filter(item => !item.isHeader);

    if (regularItems.length === 0) return null;

    return (
      <div key={category} className="mb-6">
        {headerItem && category !== 'main' && (
          <div className="px-3 mb-2">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <headerItem.icon className="w-4 h-4 mr-2" />
              {headerItem.label}
            </div>
          </div>
        )}
        <div className="space-y-1">
          {(category === 'main' ? items : regularItems).map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: currentView === item.id 
                  ? (theme?.colors?.primary + '15' || 'rgba(37, 99, 235, 0.1)')
                  : 'transparent',
                color: currentView === item.id 
                  ? (theme?.colors?.primary || '#2563eb')
                  : (theme?.colors?.text || '#374151'),
                borderLeft: currentView === item.id 
                  ? `4px solid ${theme?.colors?.primary || '#2563eb'}`
                  : '4px solid transparent',
                boxShadow: currentView === item.id 
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = theme?.colors?.primary + '08' || 'rgba(37, 99, 235, 0.05)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-64 border-r flex flex-col h-full shadow-lg"
      style={{
        background: theme?.colors?.surface 
          ? `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.background || '#f8fafc'} 100%)`
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderColor: theme?.colors?.border || '#e5e7eb'
      }}
    >
      <div 
        className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700"
      >
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <div 
              className="text-xl font-bold text-white"
            >
              BSK Providers
            </div>
            <div 
              className="text-xs text-blue-100"
            >
              Enterprise Edition
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Section */}
        {groupedItems.main && renderMenuSection('main', groupedItems.main)}
        
        {/* Other Sections */}
        {Object.entries(groupedItems)
          .filter(([category]) => category !== 'main')
          .map(([category, items]) => renderMenuSection(category, items))}
      </nav>

      {/* User Info & Status */}
      <div 
        className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50"
        style={{ borderColor: theme?.colors?.border || '#e5e7eb' }}
      >
        <div className="flex items-center mb-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${theme?.colors?.primary || '#2563eb'}, ${theme?.colors?.secondary || '#059669'})`,
            }}
          >
            <UserCheck 
              className="w-5 h-5 text-white"
            />
          </div>
          <div className="ml-3">
            <div 
              className="text-sm font-semibold"
              style={{ color: theme?.colors?.text || '#1f2937' }}
            >
              {user.name}
            </div>
            <div 
              className="text-xs capitalize"
              style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
            >
              {user.role}
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div 
          className="flex items-center justify-between text-xs bg-white/50 rounded-lg p-2"
          style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
        >
          <div className="flex items-center">
            <Wifi 
              className="w-3 h-3 mr-1" 
              style={{ color: theme?.colors?.success || '#10b981' }}
            />
            Online
          </div>
          <div className="flex items-center">
            <Database 
              className="w-3 h-3 mr-1" 
              style={{ color: theme?.colors?.info || '#3b82f6' }}
            />
            Synced
          </div>
        </div>
      </div>
    </div>
  );
};