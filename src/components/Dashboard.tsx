import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Star,
  Zap
} from 'lucide-react';
import { User, Store } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface DashboardProps {
  user: User;
  store: Store | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, store }) => {
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [notifications, setNotifications] = React.useState<string[]>([]);
  const [quickActionData, setQuickActionData] = React.useState({
    totalProducts: 1247,
    totalCustomers: 2341,
    pendingReports: 3,
    activeSessions: 12
  });

  const handleQuickAction = async (action: string) => {
    setIsProcessing(action);
    
    // Real-time backend simulation with progress updates
    const progressSteps = [
      'Connecting to server...',
      'Validating permissions...',
      'Processing request...',
      'Updating database...',
      'Finalizing...'
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      setNotifications(prev => {
        const newNotifications = [...prev];
        if (newNotifications.length > 0) {
          newNotifications[newNotifications.length - 1] = progressSteps[i];
        } else {
          newNotifications.push(progressSteps[i]);
        }
        return newNotifications;
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    switch (action) {
      case 'add-product':
        if (hasPermission(user, PERMISSIONS.INVENTORY_ADD)) {
          // Simulate backend product creation
          const newProduct = {
            id: `PRD-${Date.now()}`,
            name: `New Product ${Math.floor(Math.random() * 1000)}`,
            price: Math.floor(Math.random() * 100) + 10,
            stock: Math.floor(Math.random() * 50) + 1
          };
          
          setQuickActionData(prev => ({
            ...prev,
            totalProducts: prev.totalProducts + 1
          }));
          
          setNotifications(prev => [...prev.slice(0, -1), `✅ Product "${newProduct.name}" added successfully! (ID: ${newProduct.id})`]);
        } else {
          setNotifications(prev => [...prev.slice(0, -1), '❌ Permission denied: Cannot add products']);
        }
        break;
      case 'add-customer':
        if (hasPermission(user, PERMISSIONS.CUSTOMERS_ADD)) {
          // Simulate backend customer creation
          const newCustomer = {
            id: `CUST-${Date.now()}`,
            name: `Customer ${Math.floor(Math.random() * 1000)}`,
            email: `customer${Math.floor(Math.random() * 1000)}@email.com`,
            loyaltyPoints: Math.floor(Math.random() * 100)
          };
          
          setQuickActionData(prev => ({
            ...prev,
            totalCustomers: prev.totalCustomers + 1
          }));
          
          setNotifications(prev => [...prev.slice(0, -1), `✅ Customer "${newCustomer.name}" registered successfully! (${newCustomer.loyaltyPoints} loyalty points)`]);
        } else {
          setNotifications(prev => [...prev.slice(0, -1), '❌ Permission denied: Cannot add customers']);
        }
        break;
      case 'view-reports':
        if (hasPermission(user, PERMISSIONS.REPORTS_VIEW)) {
          // Simulate backend report generation
          const reportData = {
            salesReport: `£${(Math.random() * 50000 + 10000).toFixed(2)}`,
            transactionCount: Math.floor(Math.random() * 500) + 100,
            topProduct: `Product ${Math.floor(Math.random() * 100)}`
          };
          
          setQuickActionData(prev => ({
            ...prev,
            pendingReports: prev.pendingReports + 1
          }));
          
          setNotifications(prev => [...prev.slice(0, -1), `📊 Report generated! Sales: ${reportData.salesReport}, Transactions: ${reportData.transactionCount}`]);
        } else {
          setNotifications(prev => [...prev.slice(0, -1), '❌ Permission denied: Cannot view reports']);
        }
        break;
      case 'pos-terminal':
        if (hasPermission(user, PERMISSIONS.POS_ACCESS)) {
          // Simulate POS terminal initialization
          const terminalData = {
            sessionId: `SES-${Date.now()}`,
            cashDrawerStatus: 'Ready',
            printerStatus: 'Online'
          };
          
          setQuickActionData(prev => ({
            ...prev,
            activeSessions: prev.activeSessions + 1
          }));
          
          setNotifications(prev => [...prev.slice(0, -1), `🖥️ POS Terminal initialized! Session: ${terminalData.sessionId}`]);
        } else {
          setNotifications(prev => [...prev.slice(0, -1), '❌ Permission denied: Cannot access POS']);
        }
        break;
    }
    
    setIsProcessing(null);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const stats = [
    {
      title: 'Today\'s Sales',
      value: '£10,850.00',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
      iconColor: 'text-emerald-600',
      shadowColor: 'shadow-emerald-200/50',
    },
    {
      title: 'Transactions',
      value: '147',
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      iconColor: 'text-blue-600',
      shadowColor: 'shadow-blue-200/50',
    },
    {
      title: 'Customers',
      value: quickActionData.totalCustomers.toLocaleString(),
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
      iconColor: 'text-purple-600',
      shadowColor: 'shadow-purple-200/50',
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: '-5.1%',
      changeType: 'decrease',
      icon: Package,
      color: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50',
      iconColor: 'text-orange-600',
      shadowColor: 'shadow-orange-200/50',
    },
  ];

  const recentTransactions = [
    { id: '#TXN-001', customer: 'John Smith', amount: '£108.50', time: '2 mins ago', status: 'completed' },
    { id: '#TXN-002', customer: 'Sarah Wilson', amount: '£76.00', time: '5 mins ago', status: 'completed' },
    { id: '#TXN-003', customer: 'Mike Johnson', amount: '£199.75', time: '8 mins ago', status: 'completed' },
    { id: '#TXN-004', customer: 'Emma Davis', amount: '£58.25', time: '12 mins ago', status: 'refunded' },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: '£38,205' },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: '£26,562' },
    { name: 'AirPods Pro', sales: 62, revenue: '£13,578' },
    { name: 'MacBook Air', sales: 12, revenue: '£10,188' },
  ];

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-6 right-6 z-50 space-y-3">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-2xl p-4 flex items-center space-x-3 animate-slide-in hover:shadow-3xl transition-all duration-300"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm font-medium text-gray-900 max-w-xs">{notification}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            {store ? `Managing ${store.name}` : 'System Overview'}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} p-6 rounded-2xl shadow-xl border border-white/30 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 ${stat.shadowColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 tracking-wide">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-600 ml-1 font-medium">vs yesterday</span>
                </div>
              </div>
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-blue-600" />
              Recent Transactions
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </div>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 rounded-xl transition-all duration-300 hover:shadow-md border border-transparent hover:border-blue-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.id}</div>
                    <div className="text-sm text-gray-600 font-medium">{transaction.customer}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{transaction.amount}</div>
                  <div className="text-sm text-gray-600">{transaction.time}</div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                    : 'bg-rose-100 text-rose-800 shadow-sm'
                }`}>
                  {transaction.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Top Products Today
            </h3>
            <div className="text-sm text-gray-500 font-medium">Updated: {new Date().toLocaleTimeString()}</div>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-pink-50/80 rounded-xl transition-all duration-300 hover:shadow-md border border-transparent hover:border-purple-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 rounded-xl flex items-center justify-center mr-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600 font-medium">{product.sales} units sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{product.revenue}</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user.role !== 'cashier' && (
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 p-8 rounded-2xl shadow-2xl border border-gray-100/50 hover:shadow-3xl transition-all duration-500 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="w-7 h-7 mr-3 text-blue-600" />
              Quick Actions
            </h3>
            <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full border border-gray-200/50">
              Real-time Backend
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <button 
              onClick={() => handleQuickAction('add-product')}
              disabled={isProcessing === 'add-product'}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 border border-blue-200/50 rounded-2xl hover:from-blue-100/90 hover:to-purple-100/70 hover:border-blue-300/70 hover:shadow-2xl hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {isProcessing === 'add-product' ? (
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Plus className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 mb-1">Add Product</span>
              <span className="text-xs text-gray-600 text-center font-medium">Create new product</span>
              <div className="text-xs text-blue-600 font-semibold mt-2">
                Total: {quickActionData.totalProducts.toLocaleString()}
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('add-customer')}
              disabled={isProcessing === 'add-customer'}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/40 border border-emerald-200/50 rounded-2xl hover:from-emerald-100/90 hover:to-cyan-100/70 hover:border-emerald-300/70 hover:shadow-2xl hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {isProcessing === 'add-customer' ? (
                <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 mb-1">Add Customer</span>
              <span className="text-xs text-gray-600 text-center font-medium">Register new customer</span>
              <div className="text-xs text-emerald-600 font-semibold mt-2">
                Total: {quickActionData.totalCustomers.toLocaleString()}
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('view-reports')}
              disabled={isProcessing === 'view-reports'}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-orange-50/80 via-red-50/60 to-pink-50/40 border border-orange-200/50 rounded-2xl hover:from-orange-100/90 hover:to-pink-100/70 hover:border-orange-300/70 hover:shadow-2xl hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {isProcessing === 'view-reports' ? (
                <div className="w-10 h-10 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 mb-1">View Reports</span>
              <span className="text-xs text-gray-600 text-center font-medium">Analytics & insights</span>
              <div className="text-xs text-orange-600 font-semibold mt-2">
                Pending: {quickActionData.pendingReports}
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('pos-terminal')}
              disabled={isProcessing === 'pos-terminal'}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-rose-50/40 border border-purple-200/50 rounded-2xl hover:from-purple-100/90 hover:to-rose-100/70 hover:border-purple-300/70 hover:shadow-2xl hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {isProcessing === 'pos-terminal' ? (
                <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 mb-1">POS Terminal</span>
              <span className="text-xs text-gray-600 text-center font-medium">Process sales</span>
              <div className="text-xs text-purple-600 font-semibold mt-2">
                Active: {quickActionData.activeSessions}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};