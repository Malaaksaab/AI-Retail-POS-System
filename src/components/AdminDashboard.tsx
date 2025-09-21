import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Store as StoreIcon, 
  Users, 
  Package, 
  DollarSign,
  Activity,
  Zap,
  Target,
  Globe,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Shield,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  TrendingDown
} from 'lucide-react';
import { User, Store, AIInsight, StorePerformance, SystemAlert } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface AdminDashboardProps {
  user: User;
  stores: Store[];
}

const mockAIInsights: AIInsight[] = [
  {
    id: 'ai-1',
    type: 'sales_prediction',
    title: 'Sales Surge Predicted',
    description: 'AI predicts 23% increase in electronics sales next week based on market trends',
    confidence: 87,
    impact: 'high',
    actionable: true,
    recommendations: [
      'Increase electronics inventory by 20%',
      'Schedule additional staff for peak hours',
      'Prepare promotional campaigns'
    ],
    data: { category: 'Electronics', predictedIncrease: 23, timeframe: '7 days' },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'ai-2',
    type: 'inventory_optimization',
    title: 'Inventory Optimization Alert',
    description: 'AI detected overstock in 3 stores and understock in 2 stores for same products',
    confidence: 94,
    impact: 'medium',
    actionable: true,
    recommendations: [
      'Transfer 50 units from Store A to Store D',
      'Transfer 30 units from Store B to Store E',
      'Adjust automatic reorder points'
    ],
    data: { affectedStores: 5, potentialSavings: 15000 },
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'ai-3',
    type: 'customer_behavior',
    title: 'Customer Behavior Pattern',
    description: 'Unusual customer purchasing patterns detected - potential fraud or system issue',
    confidence: 76,
    impact: 'critical',
    actionable: true,
    recommendations: [
      'Review transactions from last 24 hours',
      'Check POS system integrity',
      'Verify staff training compliance'
    ],
    data: { anomalyScore: 8.5, affectedTransactions: 12 },
    createdAt: '2024-01-15T08:45:00Z'
  }
];

const mockStorePerformance: StorePerformance[] = [
  {
    storeId: '1',
    storeName: 'Downtown Store',
    dailySales: 15420,
    monthlySales: 425600,
    yearlyGrowth: 12.5,
    customerCount: 1247,
    averageTransaction: 68.50,
    inventoryTurnover: 8.2,
    profitMargin: 23.4,
    staffCount: 12,
    performanceScore: 94,
    ranking: 1
  },
  {
    storeId: '2',
    storeName: 'Mall Location',
    dailySales: 12850,
    monthlySales: 387200,
    yearlyGrowth: 8.7,
    customerCount: 1089,
    averageTransaction: 72.30,
    inventoryTurnover: 7.8,
    profitMargin: 21.8,
    staffCount: 10,
    performanceScore: 89,
    ranking: 2
  },
  {
    storeId: '3',
    storeName: 'Westside Branch',
    dailySales: 9630,
    monthlySales: 298400,
    yearlyGrowth: 15.2,
    customerCount: 892,
    averageTransaction: 65.80,
    inventoryTurnover: 9.1,
    profitMargin: 25.1,
    staffCount: 8,
    performanceScore: 87,
    ranking: 3
  },
  {
    storeId: '4',
    storeName: 'North Plaza',
    dailySales: 8940,
    monthlySales: 267800,
    yearlyGrowth: 5.3,
    customerCount: 756,
    averageTransaction: 59.40,
    inventoryTurnover: 6.9,
    profitMargin: 19.7,
    staffCount: 9,
    performanceScore: 78,
    ranking: 4
  },
  {
    storeId: '5',
    storeName: 'East Side Store',
    dailySales: 11200,
    monthlySales: 336000,
    yearlyGrowth: 18.9,
    customerCount: 1034,
    averageTransaction: 71.20,
    inventoryTurnover: 8.7,
    profitMargin: 24.3,
    staffCount: 11,
    performanceScore: 91,
    ranking: 2
  }
];

const mockSystemAlerts: SystemAlert[] = [
  {
    id: 'alert-1',
    type: 'critical',
    title: 'System Performance Degradation',
    message: 'Database response time increased by 45% in the last hour',
    timestamp: '2024-01-15T11:30:00Z',
    isRead: false,
    priority: 'critical',
    category: 'performance',
    actionRequired: true,
    autoResolve: false
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Low Stock Alert - Multiple Stores',
    message: '15 products are below minimum stock levels across 3 stores',
    timestamp: '2024-01-15T10:45:00Z',
    isRead: false,
    priority: 'high',
    category: 'inventory',
    actionRequired: true,
    autoResolve: false
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Scheduled Maintenance Complete',
    message: 'Payment gateway maintenance completed successfully',
    timestamp: '2024-01-15T09:00:00Z',
    isRead: true,
    priority: 'low',
    category: 'system',
    actionRequired: false,
    autoResolve: true
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, stores }) => {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(mockAIInsights);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>(mockStorePerformance);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(mockSystemAlerts);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const canAccessAI = hasPermission(user, PERMISSIONS.AI_INSIGHTS);
  const canAccessEnterprise = hasPermission(user, PERMISSIONS.ENTERPRISE_DASHBOARD);

  const generateAIInsights = async () => {
    setIsAIProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      const newInsight: AIInsight = {
        id: `ai-${Date.now()}`,
        type: 'performance_alert',
        title: 'Performance Optimization Opportunity',
        description: 'AI identified potential 12% efficiency improvement in inventory management',
        confidence: 91,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Implement automated reorder system',
          'Optimize supplier delivery schedules',
          'Reduce manual inventory checks by 40%'
        ],
        data: { efficiencyGain: 12, costSavings: 25000 },
        createdAt: new Date().toISOString()
      };
      setAiInsights([newInsight, ...aiInsights]);
      setIsAIProcessing(false);
    }, 3000);
  };

  const totalSales = storePerformance.reduce((sum, store) => sum + store.dailySales, 0);
  const totalCustomers = storePerformance.reduce((sum, store) => sum + store.customerCount, 0);
  const averageGrowth = storePerformance.reduce((sum, store) => sum + store.yearlyGrowth, 0) / storePerformance.length;
  const criticalAlerts = systemAlerts.filter(alert => alert.priority === 'critical' && !alert.isRead).length;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!canAccessEnterprise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Enterprise Access Required</h3>
          <p className="text-gray-500">This dashboard requires enterprise-level permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="w-8 h-8 mr-3 text-blue-600" />
            Enterprise Command Center
          </h1>
          <p className="text-gray-600">AI-Powered Multi-Store Management & Analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          {canAccessAI && (
            <button
              onClick={generateAIInsights}
              disabled={isAIProcessing}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Brain className="w-5 h-5 mr-2" />
              {isAIProcessing ? 'Processing...' : 'Generate AI Insights'}
            </button>
          )}
        </div>
      </div>

      {/* Enterprise KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Network Sales</p>
              <p className="text-3xl font-bold">£{totalSales.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">+{averageGrowth.toFixed(1)}% growth</span>
              </div>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Stores</p>
              <p className="text-3xl font-bold">{stores.length}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">All operational</span>
              </div>
            </div>
            <StoreIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Customers</p>
              <p className="text-3xl font-bold">{totalCustomers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">Across all stores</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Critical Alerts</p>
              <p className="text-3xl font-bold">{criticalAlerts}</p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm">Require attention</span>
              </div>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights Panel */}
        {canAccessAI && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-purple-600" />
                  AI-Powered Insights
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">AI Active</span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact}
                      </span>
                      <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                    </div>
                  </div>
                  {insight.actionable && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <Target className="w-3 h-3 mr-2 text-blue-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Health Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-green-600" />
              System Health
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wifi className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">Network</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HardDrive className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-700">Storage</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-yellow-600">78% Used</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cpu className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">CPU Usage</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Performance Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Store Performance Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ranking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storePerformance.map((store) => (
                <tr key={store.storeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <StoreIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{store.storeName}</div>
                        <div className="text-sm text-gray-500">{store.staffCount} staff</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">£{store.dailySales.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">£{store.monthlySales.toLocaleString()} monthly</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {store.yearlyGrowth > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${store.yearlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {store.yearlyGrowth > 0 ? '+' : ''}{store.yearlyGrowth}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {store.customerCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    £{store.averageTransaction.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${store.performanceScore}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getPerformanceColor(store.performanceScore)}`}>
                        {store.performanceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {store.ranking <= 3 && <Award className="w-4 h-4 text-yellow-500 mr-1" />}
                      <span className="text-sm font-medium text-gray-900">#{store.ranking}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
            System Alerts & Notifications
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {systemAlerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    alert.type === 'critical' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'success' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {alert.type === 'critical' || alert.type === 'error' ? (
                      <XCircle className={`w-5 h-5 ${alert.type === 'critical' ? 'text-red-600' : 'text-red-500'}`} />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.priority}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{alert.category}</span>
                    </div>
                  </div>
                </div>
                {alert.actionRequired && (
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Take Action
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};