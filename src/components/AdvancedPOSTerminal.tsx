import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  ShoppingCart, 
  CreditCard, 
  DollarSign, 
  User, 
  Plus, 
  Minus, 
  Trash2,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Printer,
  Wifi,
  WifiOff,
  Settings,
  Pause,
  Play,
  Split,
  Search,
  Filter,
  Star,
  Heart,
  Gift,
  Award,
  Target,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Save,
  X,
  Users,
  Package,
  Tag,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Database,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  User as UserType, 
  Store, 
  Product, 
  Customer, 
  TransactionItem, 
  TemporaryBasket, 
  HardwareStatus,
  CRMCustomer,
  ECPManagement,
  CashOutSession,
  AdvancedSearchFilter,
  SalesManagement,
  InventoryAdjustment,
  AutoInventoryRule,
  DualPayment
} from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { hardwareManager } from '../utils/hardware';
import { DualPaymentModal } from './DualPaymentModal';

interface AdvancedPOSTerminalProps {
  user: UserType;
  store: Store | null;
  stores: Store[];
}

export const AdvancedPOSTerminal: React.FC<AdvancedPOSTerminalProps> = ({ user, store, stores }) => {
  // Core POS State
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CRMCustomer | null>(null);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'dual'>('card');
  const [discount, setDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDualPayment, setShowDualPayment] = useState(false);

  // Advanced Features State
  const [activeTab, setActiveTab] = useState('pos');
  const [crmCustomers, setCrmCustomers] = useState<CRMCustomer[]>([]);
  const [ecpData, setEcpData] = useState<ECPManagement[]>([]);
  const [cashOutSession, setCashOutSession] = useState<CashOutSession | null>(null);
  const [searchFilters, setSearchFilters] = useState<AdvancedSearchFilter>({
    categories: [],
    priceRange: { min: 0, max: 10000 },
    stockRange: { min: 0, max: 1000 },
    suppliers: [],
    stores: [],
    dateRange: { start: '', end: '' },
    status: [],
    tags: [],
    customFields: {}
  });
  const [salesTargets, setSalesTargets] = useState<SalesManagement[]>([]);
  const [inventoryAdjustments, setInventoryAdjustments] = useState<InventoryAdjustment[]>([]);
  const [autoInventoryRules, setAutoInventoryRules] = useState<AutoInventoryRule[]>([]);

  // Real-time Backend State
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [pendingSync, setPendingSync] = useState(0);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    payment_gateway: 'healthy',
    inventory_sync: 'healthy',
    crm_sync: 'healthy'
  });

  // Mock Data with Real-time Updates
  const [products, setProducts] = useState<Product[]>([
    { 
      id: '1', 
      name: 'iPhone 15 Pro', 
      barcode: '123456789', 
      category: 'Electronics', 
      price: 849.00, 
      cost: 650.00, 
      stock: 25, 
      minStock: 5, 
      maxStock: 100,
      description: 'Latest iPhone with advanced features',
      storeId: store?.id || '1',
      isActive: true,
      taxable: true,
      trackStock: true,
      sellByWeight: false,
      ageRestricted: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    { 
      id: '2', 
      name: 'Samsung Galaxy S24', 
      barcode: '987654321', 
      category: 'Electronics', 
      price: 699.00, 
      cost: 520.00, 
      stock: 30, 
      minStock: 5, 
      maxStock: 100,
      description: 'Samsung flagship smartphone',
      storeId: store?.id || '1',
      isActive: true,
      taxable: true,
      trackStock: true,
      sellByWeight: false,
      ageRestricted: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    { 
      id: '3', 
      name: 'AirPods Pro', 
      barcode: '456789123', 
      category: 'Electronics', 
      price: 219.00, 
      cost: 160.00, 
      stock: 50, 
      minStock: 10, 
      maxStock: 100,
      description: 'Wireless noise-canceling earbuds',
      storeId: store?.id || '1',
      isActive: true,
      taxable: true,
      trackStock: true,
      sellByWeight: false,
      ageRestricted: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
  ]);

  // Initialize Real-time Backend Systems
  useEffect(() => {
    initializeRealTimeBackend();
    startCashOutSession();
    loadCRMData();
    loadECPData();
    setupInventoryAutoAdjustment();
    
    // Real-time sync every 30 seconds
    const syncInterval = setInterval(() => {
      syncWithBackend();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  const initializeRealTimeBackend = async () => {
    console.log('🚀 Initializing Real-time Backend Systems...');
    
    // Simulate backend initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Initialize sales targets
    const mockSalesTargets: SalesManagement[] = [
      {
        id: 'target-1',
        type: 'target',
        title: 'Daily Sales Target',
        description: 'Achieve £2,000 in daily sales',
        targetValue: 2000,
        currentValue: 1450,
        period: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        applicableStores: [store?.id || '1'],
        applicableEmployees: [user.id],
        rewards: [
          { threshold: 100, reward_type: 'cash', reward_value: 50, description: '£50 bonus for hitting target' }
        ],
        status: 'active',
        progress: 72.5
      }
    ];
    setSalesTargets(mockSalesTargets);

    // Initialize auto inventory rules
    const mockAutoRules: AutoInventoryRule[] = [
      {
        id: 'rule-1',
        productId: '1',
        productName: 'iPhone 15 Pro',
        storeId: store?.id || '1',
        reorderPoint: 5,
        reorderQuantity: 20,
        maxStock: 100,
        supplierId: '1',
        supplierName: 'TechWorld Distributors',
        leadTimeDays: 3,
        isActive: true,
        priority: 'high'
      }
    ];
    setAutoInventoryRules(mockAutoRules);

    console.log('✅ Real-time Backend Systems Initialized');
  };

  const syncWithBackend = async () => {
    try {
      console.log('🔄 Syncing with backend...');
      
      // Simulate real-time data sync
      setLastSync(new Date());
      
      // Update system health
      setSystemHealth({
        database: Math.random() > 0.1 ? 'healthy' : 'warning',
        payment_gateway: Math.random() > 0.05 ? 'healthy' : 'error',
        inventory_sync: Math.random() > 0.08 ? 'healthy' : 'warning',
        crm_sync: Math.random() > 0.12 ? 'healthy' : 'warning'
      });

      // Auto-adjust inventory based on rules
      autoAdjustInventory();
      
      console.log('✅ Backend sync completed');
    } catch (error) {
      console.error('❌ Backend sync failed:', error);
      setIsOnline(false);
    }
  };

  const startCashOutSession = () => {
    const session: CashOutSession = {
      id: `session-${Date.now()}`,
      cashierId: user.id,
      cashierName: user.name,
      storeId: store?.id || '1',
      storeName: store?.name || 'Demo Store',
      sessionStart: new Date().toISOString(),
      openingCash: 200.00, // Starting cash float
      closingCash: 0,
      expectedCash: 200.00,
      variance: 0,
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      refunds: 0,
      voids: 0,
      discounts: 0,
      transactions: [],
      status: 'active'
    };
    setCashOutSession(session);
  };

  const loadCRMData = async () => {
    // Simulate CRM data loading
    const mockCRMCustomers: CRMCustomer[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@email.com',
        phone: '555-0123',
        address: '123 Main St',
        loyaltyPoints: 150,
        totalPurchases: 2150,
        registrationDate: '2024-01-15',
        tier: 'silver',
        isActive: true,
        purchaseHistory: [],
        preferences: [
          { id: 'pref-1', customerId: '1', category: 'Electronics', preference: 'Apple Products', strength: 9, lastUpdated: '2024-01-15' }
        ],
        communicationHistory: [
          { id: 'comm-1', customerId: '1', type: 'email', subject: 'Welcome!', content: 'Welcome to our store', timestamp: '2024-01-15T10:00:00Z', status: 'delivered', employeeId: user.id }
        ],
        segments: ['High Value', 'Tech Enthusiast'],
        lifetime_value: 2150,
        acquisition_date: '2024-01-15',
        last_interaction: '2024-01-15T15:30:00Z',
        risk_score: 2,
        satisfaction_score: 4.8,
        referrals: 3
      }
    ];
    setCrmCustomers(mockCRMCustomers);
  };

  const loadECPData = async () => {
    // Simulate ECP (Employee Customer Points) data loading
    const mockECPData: ECPManagement[] = [
      {
        id: 'ecp-1',
        customerId: '1',
        customerName: 'John Smith',
        points_earned: 215,
        points_redeemed: 65,
        points_balance: 150,
        tier: 'silver',
        tier_benefits: ['5% discount', 'Free shipping', 'Priority support'],
        next_tier_requirement: 350,
        transactions: [
          { id: 'ecp-trans-1', type: 'earned', points: 25, description: 'Purchase bonus', timestamp: '2024-01-15T10:00:00Z' }
        ]
      }
    ];
    setEcpData(mockECPData);
  };

  const setupInventoryAutoAdjustment = () => {
    // Real-time inventory monitoring
    setInterval(() => {
      autoAdjustInventory();
    }, 60000); // Check every minute
  };

  const autoAdjustInventory = () => {
    products.forEach(product => {
      const rule = autoInventoryRules.find(r => r.productId === product.id && r.isActive);
      if (rule && product.stock <= rule.reorderPoint) {
        // Trigger auto-reorder
        const adjustment: InventoryAdjustment = {
          id: `adj-${Date.now()}-${product.id}`,
          productId: product.id,
          productName: product.name,
          storeId: product.storeId,
          storeName: store?.name || 'Demo Store',
          adjustmentType: 'auto_reorder',
          quantityBefore: product.stock,
          quantityAfter: product.stock + rule.reorderQuantity,
          quantityChanged: rule.reorderQuantity,
          reason: `Auto-reorder triggered: Stock below ${rule.reorderPoint}`,
          triggeredBy: 'system',
          timestamp: new Date().toISOString(),
          cost_impact: rule.reorderQuantity * product.cost,
          status: 'completed'
        };

        setInventoryAdjustments(prev => [...prev, adjustment]);
        
        // Update product stock
        setProducts(prev => prev.map(p => 
          p.id === product.id 
            ? { ...p, stock: p.stock + rule.reorderQuantity }
            : p
        ));

        console.log(`🔄 Auto-reorder triggered for ${product.name}: +${rule.reorderQuantity} units`);
      }
    });
  };

  // Advanced Search with Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = searchFilters.categories.length === 0 || 
                           searchFilters.categories.includes(product.category);
    
    const matchesPrice = product.price >= searchFilters.priceRange.min && 
                        product.price <= searchFilters.priceRange.max;
    
    const matchesStock = product.stock >= searchFilters.stockRange.min && 
                        product.stock <= searchFilters.stockRange.max;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  // POS Terminal Functions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Product out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Not enough stock available!');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: item.price * (item.quantity + 1) }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        quantity: 1,
        price: product.price,
        total: product.price
      }]);
    }

    // Update product stock in real-time
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, stock: p.stock - 1 } : p
    ));

    // Update sales targets in real-time
    updateSalesProgress(product.price);
  };

  const updateSalesProgress = (amount: number) => {
    setSalesTargets(prev => prev.map(target => ({
      ...target,
      currentValue: target.currentValue + amount,
      progress: ((target.currentValue + amount) / target.targetValue) * 100
    })));
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    
    const heldOrder = {
      id: `hold-${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: [...cart],
      subtotal: cart.reduce((sum, item) => sum + item.total, 0),
      tax: cart.reduce((sum, item) => sum + item.total, 0) * 0.20,
      total: cart.reduce((sum, item) => sum + item.total, 0) * 1.20,
      cashierId: user.id,
      cashierName: user.name,
      heldAt: new Date().toISOString(),
      reason: 'Order held by cashier',
      status: 'held',
      priority: 'medium'
    };
    
    setHeldOrders([...heldOrders, heldOrder]);
    setCart([]);
    setSelectedCustomer(null);
    alert(`Order ${heldOrder.orderNumber} has been held`);
  };

  const handleResumeOrder = (orderId: string) => {
    const order = heldOrders.find(o => o.id === orderId);
    if (order) {
      setCart(order.items);
      setSelectedCustomer(order.customerId ? crmCustomers.find(c => c.id === order.customerId) || null : null);
      setHeldOrders(heldOrders.filter(o => o.id !== orderId));
      setCurrentOrderId(orderId);
      alert(`Order ${order.orderNumber} resumed`);
    }
  };

  const processPayment = async () => {
    if (cart.length === 0) return;
    
    setIsProcessingPayment(true);

    try {
      const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.20;
      const total = subtotal + tax - (subtotal * (discount / 100));

      // Update cash out session
      if (cashOutSession) {
        const updatedSession = {
          ...cashOutSession,
          totalSales: cashOutSession.totalSales + total,
          cashSales: paymentMethod === 'cash' ? cashOutSession.cashSales + total : cashOutSession.cashSales,
          cardSales: paymentMethod === 'card' ? cashOutSession.cardSales + total : cashOutSession.cardSales,
          expectedCash: cashOutSession.expectedCash + (paymentMethod === 'cash' ? total : 0),
          transactions: [...cashOutSession.transactions, `TXN-${Date.now()}`]
        };
        setCashOutSession(updatedSession);
      }

      // Update customer ECP points
      if (selectedCustomer) {
        const pointsEarned = Math.floor(total / 10);
        setEcpData(prev => prev.map(ecp => 
          ecp.customerId === selectedCustomer.id
            ? {
                ...ecp,
                points_earned: ecp.points_earned + pointsEarned,
                points_balance: ecp.points_balance + pointsEarned,
                transactions: [...ecp.transactions, {
                  id: `ecp-${Date.now()}`,
                  type: 'earned',
                  points: pointsEarned,
                  description: `Purchase: £${total.toFixed(2)}`,
                  transaction_id: `TXN-${Date.now()}`,
                  timestamp: new Date().toISOString()
                }]
              }
            : ecp
        ));
      }

      // Process payment based on method
      if (paymentMethod === 'dual') {
        setShowDualPayment(true);
        return;
      }

      // Print receipt if hardware available
      if (store?.hardware?.printer?.enabled) {
        await hardwareManager.printReceipt({
          transaction: {
            id: `TXN-${Date.now()}`,
            receiptNumber: `RCP-${Date.now()}`,
            date: new Date().toISOString(),
            items: cart,
            subtotal,
            tax,
            total,
            paymentMethod,
            cashierName: user.name,
            customerName: selectedCustomer?.name
          },
          store
        }, store.hardware.printer);
      }

      // Clear cart and reset
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCashOut = async () => {
    if (!cashOutSession) return;

    const actualCash = prompt('Enter actual cash count:');
    if (actualCash === null) return;

    const actualCashAmount = parseFloat(actualCash) || 0;
    const variance = actualCashAmount - cashOutSession.expectedCash;

    const updatedSession: CashOutSession = {
      ...cashOutSession,
      sessionEnd: new Date().toISOString(),
      closingCash: actualCashAmount,
      variance,
      status: Math.abs(variance) > 5 ? 'discrepancy' : 'completed'
    };

    setCashOutSession(updatedSession);
    
    if (Math.abs(variance) > 5) {
      alert(`Cash discrepancy detected: £${variance.toFixed(2)}. Session flagged for review.`);
    } else {
      alert('Cash out completed successfully!');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.20;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const tabs = [
    { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'ecp', label: 'ECP Management', icon: Award },
    { id: 'sales', label: 'Sales Management', icon: TrendingUp },
    { id: 'inventory', label: 'Auto Inventory', icon: Package },
    { id: 'cashout', label: 'Cash Out', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time System Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center space-x-4">
              {Object.entries(systemHealth).map(([system, status]) => (
                <div key={system} className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'healthy' ? 'bg-green-500' :
                    status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-600 capitalize">{system.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last Sync: {lastSync.toLocaleTimeString()} | Pending: {pendingSync}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* POS Terminal Tab */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Panel - Products & Search */}
              <div className="col-span-8 space-y-6">
                {/* Advanced Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Product Search</h3>
                    <button
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Advanced Filters
                    </button>
                  </div>

                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search products by name, barcode, or category..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Scan barcode"
                        className="w-48 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const product = products.find(p => p.barcode === barcode);
                            if (product) {
                              addToCart(product);
                              setBarcode('');
                            } else {
                              alert('Product not found');
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Advanced Filters Panel */}
                  {showAdvancedSearch && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={searchFilters.priceRange.min}
                              onChange={(e) => setSearchFilters({
                                ...searchFilters,
                                priceRange: { ...searchFilters.priceRange, min: Number(e.target.value) || 0 }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={searchFilters.priceRange.max}
                              onChange={(e) => setSearchFilters({
                                ...searchFilters,
                                priceRange: { ...searchFilters.priceRange, max: Number(e.target.value) || 10000 }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Range</label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={searchFilters.stockRange.min}
                              onChange={(e) => setSearchFilters({
                                ...searchFilters,
                                stockRange: { ...searchFilters.stockRange, min: Number(e.target.value) || 0 }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={searchFilters.stockRange.max}
                              onChange={(e) => setSearchFilters({
                                ...searchFilters,
                                stockRange: { ...searchFilters.stockRange, max: Number(e.target.value) || 1000 }
                              })}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Products ({filteredProducts.length})</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{product.category}</div>
                        <div className="font-bold text-blue-600 mt-2">£{product.price.toFixed(2)}</div>
                        <div className={`text-xs mt-1 ${product.stock <= product.minStock ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                          Stock: {product.stock} {product.stock <= product.minStock && '⚠️'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Cart & Checkout */}
              <div className="col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Cart ({cart.length})
                    </h3>
                  </div>

                  {/* Customer Selection with CRM */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                    <select
                      value={selectedCustomer?.id || ''}
                      onChange={(e) => {
                        const customer = crmCustomers.find(c => c.id === e.target.value);
                        setSelectedCustomer(customer || null);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Walk-in Customer</option>
                      {crmCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.loyaltyPoints} pts - {customer.tier})
                        </option>
                      ))}
                    </select>
                    {selectedCustomer && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium text-blue-900">LTV: £{selectedCustomer.lifetime_value}</div>
                          <div className="text-blue-700">Satisfaction: {selectedCustomer.satisfaction_score}/5</div>
                          <div className="text-blue-700">Segments: {selectedCustomer.segments.join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Held Orders */}
                  {heldOrders.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Held Orders ({heldOrders.length})</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {heldOrders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleResumeOrder(order.id)}
                            className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm font-medium text-orange-800">{order.orderNumber}</div>
                                <div className="text-xs text-orange-600">{order.customerName}</div>
                              </div>
                              <div className="text-sm font-medium text-orange-800">£{order.total.toFixed(2)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Cart is empty</p>
                      </div>
                    ) : (
                      cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-500">£{item.price.toFixed(2)} each</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const newQuantity = item.quantity - 1;
                                if (newQuantity <= 0) {
                                  setCart(cart.filter(c => c.productId !== item.productId));
                                  // Return stock
                                  setProducts(prev => prev.map(p => 
                                    p.id === item.productId ? { ...p, stock: p.stock + 1 } : p
                                  ));
                                } else {
                                  setCart(cart.map(c => 
                                    c.productId === item.productId 
                                      ? { ...c, quantity: newQuantity, total: c.price * newQuantity }
                                      : c
                                  ));
                                  // Return 1 stock
                                  setProducts(prev => prev.map(p => 
                                    p.id === item.productId ? { ...p, stock: p.stock + 1 } : p
                                  ));
                                }
                              }}
                              className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                            >
                              <Minus className="w-3 h-3 mx-auto" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => {
                                const product = products.find(p => p.id === item.productId);
                                if (product && product.stock > 0) {
                                  setCart(cart.map(c => 
                                    c.productId === item.productId 
                                      ? { ...c, quantity: c.quantity + 1, total: c.price * (c.quantity + 1) }
                                      : c
                                  ));
                                  setProducts(prev => prev.map(p => 
                                    p.id === item.productId ? { ...p, stock: p.stock - 1 } : p
                                  ));
                                } else {
                                  alert('Not enough stock!');
                                }
                              }}
                              className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                            >
                              <Plus className="w-3 h-3 mx-auto" />
                            </button>
                            <button
                              onClick={() => {
                                const itemToRemove = cart.find(c => c.productId === item.productId);
                                if (itemToRemove) {
                                  setCart(cart.filter(c => c.productId !== item.productId));
                                  // Return all stock
                                  setProducts(prev => prev.map(p => 
                                    p.id === item.productId ? { ...p, stock: p.stock + itemToRemove.quantity } : p
                                  ));
                                }
                              }}
                              className="w-6 h-6 bg-red-100 rounded text-red-600 hover:bg-red-200"
                            >
                              <Trash2 className="w-3 h-3 mx-auto" />
                            </button>
                          </div>
                          <div className="w-16 text-right font-medium">£{item.total.toFixed(2)}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Discount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">£{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discount}%):</span>
                        <span>-£{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT (20%):</span>
                      <span className="font-medium">£{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'card', label: 'Card', icon: CreditCard },
                        { value: 'cash', label: 'Cash', icon: DollarSign },
                        { value: 'mobile', label: 'Mobile', icon: Phone },
                        { value: 'dual', label: 'Split', icon: Split },
                      ].map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value as any)}
                          className={`flex items-center justify-center p-3 border rounded-lg text-sm font-medium transition-colors ${
                            paymentMethod === method.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <method.icon className="w-4 h-4 mr-2" />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={processPayment}
                      disabled={cart.length === 0 || isProcessingPayment}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Complete Sale (£{total.toFixed(2)})
                        </>
                      )}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleHoldOrder}
                        disabled={cart.length === 0}
                        className="bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Hold
                      </button>
                      
                      <button
                        onClick={() => {
                          // Return all stock
                          cart.forEach(item => {
                            setProducts(prev => prev.map(p => 
                              p.id === item.productId ? { ...p, stock: p.stock + item.quantity } : p
                            ));
                          });
                          setCart([]);
                          setSelectedCustomer(null);
                          setDiscount(0);
                        }}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CRM Tab */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Customer Relationship Management</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {crmCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{customer.tier} Member</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < customer.satisfaction_score ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{customer.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{customer.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">LTV: £{customer.lifetime_value}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{customer.loyaltyPoints} points</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {customer.segments.map((segment, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {segment}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm">
                          View Profile
                        </button>
                        <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ECP Management Tab */}
          {activeTab === 'ecp' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Employee Customer Points Management</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ecpData.map((ecp) => (
                  <div key={ecp.id} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Award className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{ecp.customerName}</h4>
                          <p className="text-sm text-purple-600 capitalize font-medium">{ecp.tier} Tier</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{ecp.points_balance}</div>
                        <div className="text-sm text-gray-600">Points</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Points Earned:</span>
                        <span className="font-medium text-green-600">+{ecp.points_earned}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Points Redeemed:</span>
                        <span className="font-medium text-red-600">-{ecp.points_redeemed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Next Tier:</span>
                        <span className="font-medium">{ecp.next_tier_requirement - ecp.points_balance} points</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Tier Benefits:</div>
                      <div className="space-y-1">
                        {ecp.tier_benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 text-sm">
                        Redeem Points
                      </button>
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm">
                        Add Bonus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Management Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Sales Management & Targets</h3>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Target className="w-4 h-4 mr-2" />
                  Create Target
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {salesTargets.map((target) => (
                  <div key={target.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{target.title}</h4>
                        <p className="text-sm text-gray-600">{target.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        target.status === 'active' ? 'bg-green-100 text-green-800' :
                        target.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {target.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">£{target.currentValue} / £{target.targetValue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(target.progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Period: {target.period}</span>
                        <span className="text-sm font-medium text-green-600">{target.progress.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Rewards:</div>
                      {target.rewards.map((reward, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center">
                          <Gift className="w-3 h-3 text-green-500 mr-2" />
                          {reward.description}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Centralized Auto-Adjustable Inventory</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All Stores
                </button>
              </div>

              {/* Auto Inventory Rules */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Auto-Reorder Rules</h4>
                <div className="space-y-4">
                  {autoInventoryRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Package className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{rule.productName}</div>
                          <div className="text-sm text-gray-600">
                            Reorder at {rule.reorderPoint} units → Order {rule.reorderQuantity} units
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rule.priority}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.isActive}
                            onChange={(e) => setAutoInventoryRules(prev => prev.map(r => 
                              r.id === rule.id ? { ...r, isActive: e.target.checked } : r
                            ))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Adjustments */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Auto-Adjustments</h4>
                <div className="space-y-3">
                  {inventoryAdjustments.slice(0, 5).map((adjustment) => (
                    <div key={adjustment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          adjustment.adjustmentType === 'auto_reorder' ? 'bg-blue-500' :
                          adjustment.adjustmentType === 'transfer_in' ? 'bg-green-500' :
                          adjustment.adjustmentType === 'transfer_out' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{adjustment.productName}</div>
                          <div className="text-sm text-gray-600">{adjustment.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {adjustment.quantityChanged > 0 ? '+' : ''}{adjustment.quantityChanged}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(adjustment.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cash Out Tab */}
          {activeTab === 'cashout' && cashOutSession && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Cash Out System</h3>
                <button
                  onClick={handleCashOut}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  End Session & Cash Out
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Session Summary */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Start:</span>
                      <span className="font-medium">{new Date(cashOutSession.sessionStart).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opening Cash:</span>
                      <span className="font-medium">£{cashOutSession.openingCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Sales:</span>
                      <span className="font-medium text-green-600">£{cashOutSession.cashSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card Sales:</span>
                      <span className="font-medium text-blue-600">£{cashOutSession.cardSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sales:</span>
                      <span className="font-medium">£{cashOutSession.totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-3">
                      <span className="font-semibold">Expected Cash:</span>
                      <span className="font-bold text-green-600">£{cashOutSession.expectedCash.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{cashOutSession.transactions.length}</div>
                        <div className="text-sm text-gray-600">Transactions</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">£{cashOutSession.totalSales.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Total Sales</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">£{cashOutSession.refunds.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Refunds</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">£{cashOutSession.voids.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Voids</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">£{cashOutSession.discounts.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Discounts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dual Payment Modal */}
      <DualPaymentModal
        isOpen={showDualPayment}
        onClose={() => setShowDualPayment(false)}
        totalAmount={total}
        onPaymentComplete={(payment) => {
          // Update cash out session for dual payment
          if (cashOutSession) {
            const updatedSession = {
              ...cashOutSession,
              totalSales: cashOutSession.totalSales + payment.totalAmount,
              cashSales: cashOutSession.cashSales + payment.cashAmount,
              cardSales: cashOutSession.cardSales + payment.cardAmount,
              expectedCash: cashOutSession.expectedCash + payment.cashAmount,
              transactions: [...cashOutSession.transactions, payment.transactionId]
            };
            setCashOutSession(updatedSession);
          }

          // Clear cart
          setCart([]);
          setSelectedCustomer(null);
          setDiscount(0);
          setShowDualPayment(false);
          
          alert(`Dual payment processed: £${payment.cashAmount} cash + £${payment.cardAmount} card`);
        }}
      />
    </div>
  );
};