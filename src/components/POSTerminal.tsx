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
  Split
} from 'lucide-react';
import { User as UserType, Store, Product, Customer, TransactionItem, TemporaryBasket, HardwareStatus } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { hardwareManager } from '../utils/hardware';
import { DualPaymentModal } from './DualPaymentModal';

interface POSTerminalProps {
  user: UserType;
  store: Store | null;
}

const mockProducts: Product[] = [
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
    storeId: '1',
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
    storeId: '1',
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
    storeId: '1',
    isActive: true,
    taxable: true,
    trackStock: true,
    sellByWeight: false,
    ageRestricted: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
];

const mockCustomers: Customer[] = [
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
    isActive: true
  },
  { 
    id: '2', 
    name: 'Sarah Wilson', 
    email: 'sarah@email.com', 
    phone: '555-0456', 
    address: '456 Oak Ave', 
    loyaltyPoints: 300, 
    totalPurchases: 4500, 
    registrationDate: '2023-11-20',
    tier: 'gold',
    isActive: true
  },
];

export const POSTerminal: React.FC<POSTerminalProps> = ({ user, store }) => {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [temporaryBaskets, setTemporaryBaskets] = useState<TemporaryBasket[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'gift_card'>('card');
  const [discount, setDiscount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showTemporaryBaskets, setShowTemporaryBaskets] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus[]>([]);
  const [cashAmount, setCashAmount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDualPayment, setShowDualPayment] = useState(false);
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.20; // 20% VAT
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  // Initialize hardware on component mount
  useEffect(() => {
    if (store?.hardware) {
      hardwareManager.initializeAllHardware(store.hardware);
    }

    // Listen for barcode scans
    const handleBarcodeScan = (scannedBarcode: string) => {
      setBarcode(scannedBarcode);
      handleBarcodeSearch(scannedBarcode);
    };

    hardwareManager.addEventListener('barcodeScan', handleBarcodeScan);

    // Update hardware status
    const updateStatus = () => {
      setHardwareStatus(hardwareManager.getAllHardwareStatus());
    };

    const statusInterval = setInterval(updateStatus, 5000);
    updateStatus();

    return () => {
      hardwareManager.removeEventListener('barcodeScan', handleBarcodeScan);
      clearInterval(statusInterval);
    };
  }, [store]);

  // Check permissions
  const canProcessSale = hasPermission(user, PERMISSIONS.POS_PROCESS_SALE);
  const canUseTemporaryBasket = hasPermission(user, PERMISSIONS.POS_TEMPORARY_BASKET);
  const canApproveBasket = hasPermission(user, PERMISSIONS.POS_APPROVE_BASKET);
  const canRefund = hasPermission(user, PERMISSIONS.POS_REFUND);
  const canVoid = hasPermission(user, PERMISSIONS.POS_VOID);
  const canDiscount = hasPermission(user, PERMISSIONS.POS_DISCOUNT);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
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
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleBarcodeSearch = (searchBarcode?: string) => {
    const searchCode = searchBarcode || barcode;
    const product = mockProducts.find(p => p.barcode === searchCode);
    if (product) {
      addToCart(product);
      setBarcode('');
    } else {
      alert('Product not found');
    }
  };

  const processPayment = async (isTemporary: boolean = false) => {
    if (cart.length === 0) return;
    
    if (!canProcessSale && !isTemporary) {
      alert('You do not have permission to process sales');
      return;
    }

    if (isTemporary && !canUseTemporaryBasket) {
      alert('You do not have permission to use temporary baskets');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const receiptNumber = `RCP${Date.now()}`;
      const transactionData = {
        id: `TXN-${Date.now()}`,
        date: new Date().toISOString(),
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        items: [...cart],
        subtotal,
        tax,
        discount: discountAmount,
        total,
        paymentMethod,
        status: isTemporary ? 'temporary' as const : 'completed' as const,
        cashierId: user.id,
        cashierName: user.name,
        storeId: store?.id || '1',
        basketType: isTemporary ? 'temporary' as const : 'permanent' as const,
        receiptNumber,
        reason: adjustmentReason || (isTemporary ? 'Training/Adjustment' : ''),
        change: paymentMethod === 'cash' ? Math.max(0, cashAmount - total) : 0,
        loyaltyPointsEarned: selectedCustomer ? Math.floor(total / 10) : 0,
      };

      if (isTemporary) {
        // Add to temporary basket
        const tempBasket: TemporaryBasket = {
          ...transactionData,
          reason: adjustmentReason || 'Stock adjustment',
          requiresApproval: true,
          priority: 'medium'
        };
        
        setTemporaryBaskets([...temporaryBaskets, tempBasket]);
        alert('Transaction saved to temporary basket for review!');
      } else {
        // Process payment based on method
        if (paymentMethod === 'card') {
          if (store?.hardware?.cardReader) {
            const result = await hardwareManager.processCardPayment(total, store.hardware.cardReader);
            if (!result.success) {
              alert(`Card payment failed: ${result.error}`);
              return;
            }
          }
        } else if (paymentMethod === 'cash') {
          if (cashAmount < total) {
            alert('Insufficient cash amount');
            return;
          }
          // Open cash drawer
          if (store?.hardware?.cashDrawer) {
            await hardwareManager.openCashDrawer(store.hardware.cashDrawer);
          }
        }

        // Print receipt
        if (store?.hardware?.printer) {
          await hardwareManager.printReceipt({
            transaction: transactionData,
            store
          }, store.hardware.printer);
        }

        alert('Payment processed successfully!');
      }
      
      // Clear cart and reset
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setAdjustmentReason('');
      setCashAmount(0);
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    
    const heldOrder = {
      id: `hold-${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      total,
      cashierId: user.id,
      cashierName: user.name,
      heldAt: new Date().toISOString(),
      reason: 'Order held by cashier',
      status: 'held'
    };
    
    setHeldOrders([...heldOrders, heldOrder]);
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    alert(`Order ${heldOrder.orderNumber} has been held`);
  };

  const handleResumeOrder = (orderId: string) => {
    const order = heldOrders.find(o => o.id === orderId);
    if (order) {
      setCart(order.items);
      setSelectedCustomer(order.customerId ? { id: order.customerId, name: order.customerName } as Customer : null);
      setDiscount((order.discount / order.subtotal) * 100);
      setHeldOrders(heldOrders.filter(o => o.id !== orderId));
      setCurrentOrderId(orderId);
      alert(`Order ${order.orderNumber} resumed`);
    }
  };

  const handleDualPayment = (payment: any) => {
    alert(`Dual payment processed: £${payment.cashAmount} cash + £${payment.cardAmount} card`);
    // Process the payment and clear cart
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setCashAmount(0);
  };

  const approveTemporaryBasket = (basketId: string) => {
    if (!canApproveBasket) {
      alert('You do not have permission to approve baskets');
      return;
    }

    const basket = temporaryBaskets.find(b => b.id === basketId);
    if (basket) {
      // Convert to permanent sale
      alert(`Transaction ${basketId} approved and converted to permanent sale!`);
      setTemporaryBaskets(temporaryBaskets.filter(b => b.id !== basketId));
    }
  };

  const deleteTemporaryBasket = (basketId: string) => {
    if (!canApproveBasket) {
      alert('You do not have permission to delete baskets');
      return;
    }

    setTemporaryBaskets(temporaryBaskets.filter(b => b.id !== basketId));
    alert(`Temporary transaction ${basketId} deleted!`);
  };

  const getHardwareStatusIcon = (device: string) => {
    const status = hardwareStatus.find(h => h.device === device);
    if (!status) return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    
    const colors = {
      connected: 'bg-green-500',
      disconnected: 'bg-gray-400',
      error: 'bg-red-500',
      maintenance: 'bg-yellow-500'
    };
    
    return <div className={`w-2 h-2 ${colors[status.status]} rounded-full`}></div>;
  };

  return (
    <div className="space-y-6">
      {/* Hardware Status Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHardwareStatusIcon('barcodeScanner')}
              <span className="text-sm text-gray-600">Scanner</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHardwareStatusIcon('printer')}
              <span className="text-sm text-gray-600">Printer</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHardwareStatusIcon('cashDrawer')}
              <span className="text-sm text-gray-600">Cash Drawer</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHardwareStatusIcon('cardReader')}
              <span className="text-sm text-gray-600">Card Reader</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Terminal: {store?.name} | Cashier: {user.name}
          </div>
        </div>
      </div>

      {/* Temporary Baskets Alert */}
      {temporaryBaskets.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="font-medium text-orange-800">
                {temporaryBaskets.length} Temporary Transaction{temporaryBaskets.length > 1 ? 's' : ''} Pending Review
              </h3>
            </div>
            <button
              onClick={() => setShowTemporaryBaskets(!showTemporaryBaskets)}
              className="text-orange-600 hover:text-orange-800 font-medium"
            >
              {showTemporaryBaskets ? 'Hide' : 'View'}
            </button>
          </div>
        </div>
      )}

      {/* Temporary Baskets List */}
      {showTemporaryBaskets && temporaryBaskets.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temporary Baskets - Pending Approval</h3>
          <div className="space-y-4">
            {temporaryBaskets.map((basket) => (
              <div key={basket.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-gray-900">{basket.id}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(basket.date).toLocaleString()}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      basket.priority === 'high' ? 'bg-red-100 text-red-800' :
                      basket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {basket.priority} priority
                    </span>
                  </div>
                  {canApproveBasket && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => approveTemporaryBasket(basket.id)}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => deleteTemporaryBasket(basket.id)}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Reason:</strong> {basket.reason}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Items:</strong> {basket.items.length} | <strong>Total:</strong> £{basket.total.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  Cashier: {basket.cashierName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Panel - Products */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">POS Terminal</h2>
              <div className="text-sm text-gray-500">
                Session: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Barcode Scanner */}
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan or enter barcode"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  />
                </div>
              </div>
              <button
                onClick={() => handleBarcodeSearch()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add
              </button>
            </div>

            {/* Held Orders */}
            {heldOrders.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Held Orders ({heldOrders.length})</h4>
                <div className="flex space-x-2 overflow-x-auto">
                  {heldOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleResumeOrder(order.id)}
                      className="flex-shrink-0 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="text-sm font-medium text-orange-800">{order.orderNumber}</div>
                      <div className="text-xs text-orange-600">{order.customerName}</div>
                      <div className="text-xs text-orange-600">£{order.total.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Products */}
            <div className="grid grid-cols-3 gap-4">
              {mockProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{product.category}</div>
                  <div className="font-bold text-blue-600 mt-2">£{product.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">Stock: {product.stock}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cart.length})
              </h3>
            </div>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = mockCustomers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Walk-in Customer</option>
                {mockCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.loyaltyPoints} pts - {customer.tier})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto space-y-2 mb-4">
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
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                      >
                        <Minus className="w-3 h-3 mx-auto" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                      >
                        <Plus className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
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

            {/* Order Actions */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                Hold Order
              </button>
              
              <button
                onClick={() => setShowDualPayment(true)}
                disabled={cart.length === 0}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Split className="w-4 h-4 mr-2" />
                Split Payment
              </button>
            </div>

            {/* Adjustment Reason */}
            {canUseTemporaryBasket && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Reason (Optional)</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Stock adjustment, Training sale, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Discount */}
            {canDiscount && (
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
            )}

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

            {/* Cash Amount Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cash Received</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {cashAmount > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Change: </span>
                    <span className="font-medium">£{Math.max(0, cashAmount - total).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Permanent Sale Button (Green) */}
              {canProcessSale && (
                <button
                  onClick={() => processPayment(false)}
                  disabled={cart.length === 0 || isProcessingPayment || (paymentMethod === 'cash' && cashAmount < total)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isProcessingPayment ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Sale (£{total.toFixed(2)})
                    </>
                  )}
                </button>
              )}
              
              {/* Temporary Basket Button (Red) */}
              {canUseTemporaryBasket && (
                <button
                  onClick={() => processPayment(true)}
                  disabled={cart.length === 0 || isProcessingPayment}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Save to Temporary Basket
                </button>
              )}
              
              <button
                onClick={() => setCart([])}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Payment Modal */}
      <DualPaymentModal
        isOpen={showDualPayment}
        onClose={() => setShowDualPayment(false)}
        totalAmount={total}
        onPaymentComplete={handleDualPayment}
      />
    </div>
  );
};