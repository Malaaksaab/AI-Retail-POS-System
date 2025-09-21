import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Gift, 
  Star, 
  Award, 
  TrendingUp, 
  Calendar, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  MapPin,
  CreditCard,
  Banknote,
  Pause,
  Play,
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Zap,
  Heart,
  Cake,
  ShoppingBag,
  Percent,
  RefreshCw,
  Save,
  Download
} from 'lucide-react';
import { 
  User, 
  Store, 
  WeeklyChallenge, 
  EmployeeBonus, 
  EmployeeOfMonth, 
  WinningProduct, 
  TopOffer, 
  CustomerAnniversary, 
  GiftManagement, 
  DualPayment, 
  WageManagement, 
  RotaSchedule, 
  HeldOrder, 
  StoreTransfer 
} from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface AdvancedPOSFeaturesProps {
  user: User;
  stores: Store[];
}

const mockWeeklyChallenges: WeeklyChallenge[] = [
  {
    id: 'wc-1',
    title: 'Sales Champion',
    description: 'Achieve highest sales this week',
    targetValue: 5000,
    currentValue: 3200,
    unit: '£',
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    participants: ['2', '3', '4', '5'],
    prize: 200,
    status: 'active',
    progress: 64
  },
  {
    id: 'wc-2',
    title: 'Customer Service Star',
    description: 'Maintain 4.8+ customer rating',
    targetValue: 4.8,
    currentValue: 4.9,
    unit: 'rating',
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    participants: ['2', '3', '4'],
    winner: '3',
    prize: 150,
    status: 'completed',
    progress: 102
  }
];

const mockEmployeeBonuses: EmployeeBonus[] = [
  {
    id: 'bonus-1',
    employeeId: '2',
    employeeName: 'Mike Chen',
    type: 'performance',
    amount: 250,
    reason: 'Exceeded monthly sales target by 20%',
    period: 'January 2024',
    dateAwarded: '2024-01-31',
    status: 'approved'
  },
  {
    id: 'bonus-2',
    employeeId: '3',
    employeeName: 'Emily Davis',
    type: 'customer_service',
    amount: 150,
    reason: 'Highest customer satisfaction rating',
    period: 'January 2024',
    dateAwarded: '2024-01-31',
    status: 'paid'
  }
];

const mockEmployeeOfMonth: EmployeeOfMonth[] = [
  {
    id: 'eom-1',
    employeeId: '4',
    employeeName: 'David Wilson',
    month: 'January',
    year: 2024,
    achievements: ['Highest Sales', 'Best Customer Rating', 'Perfect Attendance'],
    totalSales: 115600,
    customerRating: 4.9,
    bonusAmount: 500
  }
];

const mockWinningProducts: WinningProduct[] = [
  {
    id: 'wp-1',
    productId: '1',
    productName: 'iPhone 15 Pro',
    category: 'Electronics',
    totalSales: 45000,
    unitsold: 45,
    revenue: 45000,
    period: 'January 2024',
    ranking: 1,
    growthRate: 23.5
  },
  {
    id: 'wp-2',
    productId: '2',
    productName: 'Samsung Galaxy S24',
    category: 'Electronics',
    totalSales: 30400,
    unitsold: 38,
    revenue: 30400,
    period: 'January 2024',
    ranking: 2,
    growthRate: 18.2
  }
];

const mockTopOffers: TopOffer[] = [
  {
    id: 'offer-1',
    title: 'Weekend Special',
    description: '20% off on all electronics',
    discountType: 'percentage',
    discountValue: 20,
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    applicableProducts: ['1', '2', '3'],
    usageCount: 45,
    maxUsage: 100,
    isActive: true,
    priority: 1
  }
];

const mockCustomerAnniversaries: CustomerAnniversary[] = [
  {
    id: 'ca-1',
    customerId: '1',
    customerName: 'John Smith',
    anniversaryType: 'registration',
    date: '2024-01-15',
    yearsCompleted: 1,
    giftOffered: '10% Discount Voucher',
    giftValue: 50,
    isRedeemed: false
  }
];

const mockGifts: GiftManagement[] = [
  {
    id: 'gift-1',
    name: 'Welcome Gift',
    description: '£10 voucher for new customers',
    type: 'voucher',
    value: 10,
    cost: 0,
    eligibilityCriteria: 'New customer registration',
    validityDays: 30,
    isActive: true,
    usageCount: 25
  }
];

const mockHeldOrders: HeldOrder[] = [
  {
    id: 'hold-1',
    orderNumber: 'ORD-001',
    customerName: 'Sarah Wilson',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', barcode: '123456789', quantity: 1, price: 849.00, total: 849.00 }
    ],
    subtotal: 849.00,
    tax: 169.80,
    total: 1018.80,
    cashierId: '3',
    cashierName: 'Emily Davis',
    heldAt: '2024-01-15T14:30:00Z',
    reason: 'Customer stepped away',
    status: 'held',
    priority: 'medium'
  }
];

const mockRotaSchedules: RotaSchedule[] = [
  {
    id: 'rota-1',
    employeeId: '2',
    employeeName: 'Mike Chen',
    storeId: '1',
    storeName: 'Downtown Store',
    date: '2024-01-16',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    role: 'manager',
    status: 'scheduled'
  },
  {
    id: 'rota-2',
    employeeId: '3',
    employeeName: 'Emily Davis',
    storeId: '1',
    storeName: 'Downtown Store',
    date: '2024-01-16',
    shiftStart: '10:00',
    shiftEnd: '18:00',
    breakStart: '14:00',
    breakEnd: '15:00',
    role: 'cashier',
    status: 'confirmed'
  }
];

const mockWages: WageManagement[] = [
  {
    id: 'wage-1',
    employeeId: '2',
    employeeName: 'Mike Chen',
    baseSalary: 3500,
    hourlyRate: 18.50,
    overtimeRate: 27.75,
    hoursWorked: 160,
    overtimeHours: 8,
    bonuses: 250,
    deductions: 50,
    totalWage: 4162,
    payPeriod: 'January 2024',
    payDate: '2024-01-31',
    status: 'calculated'
  }
];

export const AdvancedPOSFeatures: React.FC<AdvancedPOSFeaturesProps> = ({ user, stores }) => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(mockWeeklyChallenges);
  const [bonuses, setBonuses] = useState<EmployeeBonus[]>(mockEmployeeBonuses);
  const [employeeOfMonth, setEmployeeOfMonth] = useState<EmployeeOfMonth[]>(mockEmployeeOfMonth);
  const [winningProducts, setWinningProducts] = useState<WinningProduct[]>(mockWinningProducts);
  const [topOffers, setTopOffers] = useState<TopOffer[]>(mockTopOffers);
  const [anniversaries, setAnniversaries] = useState<CustomerAnniversary[]>(mockCustomerAnniversaries);
  const [gifts, setGifts] = useState<GiftManagement[]>(mockGifts);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(mockHeldOrders);
  const [rotaSchedules, setRotaSchedules] = useState<RotaSchedule[]>(mockRotaSchedules);
  const [wages, setWages] = useState<WageManagement[]>(mockWages);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const canManageFeatures = hasPermission(user, PERMISSIONS.USERS_VIEW) && user.role === 'admin';

  if (!canManageFeatures) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Admin Access Required</h3>
          <p className="text-gray-500">Advanced POS features are only available to administrators</p>
        </div>
      </div>
    );
  }

  const handleAction = async (action: string, data?: any) => {
    setIsProcessing(action);
    
    // Simulate backend processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    switch (action) {
      case 'create-challenge':
        const newChallenge: WeeklyChallenge = {
          id: `wc-${Date.now()}`,
          title: data.title || 'New Challenge',
          description: data.description || 'Challenge description',
          targetValue: data.targetValue || 1000,
          currentValue: 0,
          unit: data.unit || '£',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          participants: [],
          prize: data.prize || 100,
          status: 'active',
          progress: 0
        };
        setChallenges([...challenges, newChallenge]);
        break;
        
      case 'award-bonus':
        const newBonus: EmployeeBonus = {
          id: `bonus-${Date.now()}`,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          type: data.type || 'performance',
          amount: data.amount || 100,
          reason: data.reason || 'Performance bonus',
          period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          dateAwarded: new Date().toISOString(),
          status: 'pending'
        };
        setBonuses([...bonuses, newBonus]);
        break;
        
      case 'hold-order':
        const heldOrder: HeldOrder = {
          id: `hold-${Date.now()}`,
          orderNumber: `ORD-${Date.now()}`,
          customerName: data.customerName || 'Walk-in Customer',
          items: data.items || [],
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          cashierId: user.id,
          cashierName: user.name,
          heldAt: new Date().toISOString(),
          reason: data.reason || 'Customer request',
          status: 'held',
          priority: data.priority || 'medium'
        };
        setHeldOrders([...heldOrders, heldOrder]);
        break;
        
      case 'resume-order':
        setHeldOrders(heldOrders.map(order => 
          order.id === data.orderId 
            ? { ...order, status: 'resumed' as const }
            : order
        ));
        break;
    }
    
    setIsProcessing(null);
  };

  const tabs = [
    { id: 'challenges', label: 'Weekly Challenges', icon: Trophy },
    { id: 'bonuses', label: 'Employee Bonuses', icon: Gift },
    { id: 'employee-month', label: 'Employee of Month', icon: Award },
    { id: 'winning-products', label: 'Winning Products', icon: Package },
    { id: 'offers', label: 'Top Offers', icon: Percent },
    { id: 'anniversaries', label: 'Customer Anniversaries', icon: Cake },
    { id: 'gifts', label: 'Gift Management', icon: Heart },
    { id: 'held-orders', label: 'Held Orders', icon: Pause },
    { id: 'rota', label: 'Staff Rota', icon: Calendar },
    { id: 'wages', label: 'Wage Management', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-purple-600" />
            Advanced POS Features
          </h1>
          <p className="text-gray-600">Comprehensive employee management and business optimization tools</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Stores</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
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
                    ? 'border-purple-500 text-purple-600'
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
          {/* Weekly Challenges */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Weekly Challenges</h3>
                <button
                  onClick={() => handleAction('create-challenge', {
                    title: 'New Sales Challenge',
                    description: 'Beat this week\'s sales target',
                    targetValue: 3000,
                    unit: '£',
                    prize: 200
                  })}
                  disabled={isProcessing === 'create-challenge'}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing === 'create-challenge' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Challenge
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Trophy className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{challenge.title}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                        challenge.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{challenge.currentValue} / {challenge.targetValue} {challenge.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(challenge.progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Prize: £{challenge.prize}</span>
                        <span className="text-sm font-medium text-purple-600">{challenge.progress}%</span>
                      </div>
                      {challenge.winner && (
                        <div className="bg-yellow-100 p-3 rounded-lg">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">Winner: {challenge.winner}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee Bonuses */}
          {activeTab === 'bonuses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Employee Bonuses</h3>
                <button
                  onClick={() => handleAction('award-bonus', {
                    employeeId: '2',
                    employeeName: 'Mike Chen',
                    type: 'performance',
                    amount: 200,
                    reason: 'Excellent customer service'
                  })}
                  disabled={isProcessing === 'award-bonus'}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing === 'award-bonus' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  Award Bonus
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bonuses.map((bonus) => (
                      <tr key={bonus.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{bonus.employeeName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                            {bonus.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-green-600">£{bonus.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{bonus.reason}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bonus.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bonus.status === 'paid' ? 'bg-green-100 text-green-800' :
                            bonus.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bonus.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employee of the Month */}
          {activeTab === 'employee-month' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Employee of the Month</h3>
              
              {employeeOfMonth.map((employee) => (
                <div key={employee.id} className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 p-8 rounded-2xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mr-6">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{employee.employeeName}</h4>
                        <p className="text-lg text-gray-600">{employee.month} {employee.year}</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-5 h-5 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-700">Rating: {employee.customerRating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">£{employee.totalSales.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                      <div className="text-lg font-semibold text-orange-600 mt-2">£{employee.bonusAmount} Bonus</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-900 mb-3">Achievements:</h5>
                    <div className="flex flex-wrap gap-2">
                      {employee.achievements.map((achievement, index) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Held Orders */}
          {activeTab === 'held-orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Held Orders</h3>
                <button
                  onClick={() => handleAction('hold-order', {
                    customerName: 'Test Customer',
                    items: [{ productId: '1', productName: 'Test Product', barcode: '123', quantity: 1, price: 10, total: 10 }],
                    subtotal: 10,
                    tax: 2,
                    total: 12,
                    reason: 'Demo hold'
                  })}
                  disabled={isProcessing === 'hold-order'}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing === 'hold-order' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  Hold Current Order
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heldOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'held' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'resumed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{order.items.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">£{order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Held:</span>
                        <span className="font-medium">{new Date(order.heldAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <strong>Reason:</strong> {order.reason}
                    </div>
                    
                    {order.status === 'held' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction('resume-order', { orderId: order.id })}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </button>
                        <button className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Rota */}
          {activeTab === 'rota' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Staff Rota Schedule</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Break</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rotaSchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900">{schedule.employeeName}</div>
                                <div className="text-sm text-gray-500 capitalize">{schedule.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{schedule.storeName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(schedule.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {schedule.shiftStart} - {schedule.shiftEnd}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {schedule.breakStart && schedule.breakEnd 
                              ? `${schedule.breakStart} - ${schedule.breakEnd}`
                              : 'No break'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                              schedule.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              schedule.status === 'absent' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {schedule.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Wage Management */}
          {activeTab === 'wages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Wage Management</h3>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Wages
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {wages.map((wage) => (
                  <div key={wage.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{wage.employeeName}</h4>
                        <p className="text-sm text-gray-600">{wage.payPeriod}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        wage.status === 'paid' ? 'bg-green-100 text-green-800' :
                        wage.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wage.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Salary:</span>
                        <span className="font-medium">£{wage.baseSalary.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hours Worked:</span>
                        <span className="font-medium">{wage.hoursWorked}h @ £{wage.hourlyRate}/h</span>
                      </div>
                      {wage.overtimeHours > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Overtime:</span>
                          <span className="font-medium">{wage.overtimeHours}h @ £{wage.overtimeRate}/h</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bonuses:</span>
                        <span className="font-medium text-green-600">+£{wage.bonuses.toFixed(2)}</span>
                      </div>
                      {wage.deductions > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Deductions:</span>
                          <span className="font-medium text-red-600">-£{wage.deductions.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-green-200 pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total Wage:</span>
                          <span className="font-bold text-green-600 text-lg">£{wage.totalWage.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Process Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs content would go here... */}
          {activeTab === 'winning-products' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Winning Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {winningProducts.map((product, index) => (
                  <div key={product.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          <span className="text-white font-bold text-sm">#{product.ranking}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{product.productName}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Units Sold:</span>
                        <span className="font-medium">{product.unitsold}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">£{product.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Growth:</span>
                        <span className="font-medium text-green-600">+{product.growthRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};