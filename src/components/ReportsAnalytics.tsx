import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Filter, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { User, Store } from '../types';

interface ReportsAnalyticsProps {
  user: User;
  store: Store | null;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ user, store }) => {
  const [dateRange, setDateRange] = useState('7d');
  const [reportType, setReportType] = useState('sales');

  const salesData = [
    { date: '2024-01-01', sales: 12450, transactions: 147, customers: 89 },
    { date: '2024-01-02', sales: 15230, transactions: 182, customers: 112 },
    { date: '2024-01-03', sales: 11890, transactions: 134, customers: 78 },
    { date: '2024-01-04', sales: 18500, transactions: 201, customers: 145 },
    { date: '2024-01-05', sales: 14320, transactions: 167, customers: 98 },
    { date: '2024-01-06', sales: 16780, transactions: 189, customers: 123 },
    { date: '2024-01-07', sales: 13960, transactions: 155, customers: 87 },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 44955, percentage: 25.5 },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: 30400, percentage: 19.8 },
    { name: 'AirPods Pro', sales: 62, revenue: 15500, percentage: 15.2 },
    { name: 'MacBook Air M2', sales: 12, revenue: 14388, percentage: 12.7 },
    { name: 'iPad Air', sales: 25, revenue: 14975, percentage: 11.8 },
  ];

  const paymentMethods = [
    { method: 'Credit/Debit Card', percentage: 65, amount: 125480 },
    { method: 'Cash', percentage: 25, amount: 48260 },
    { method: 'Mobile Payment', percentage: 8, amount: 15430 },
    { method: 'Gift Card', percentage: 2, amount: 3850 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">£89,160</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">1,275</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+8.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">732</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+15.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">£69.86</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+3.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="sales">Sales</option>
                <option value="transactions">Transactions</option>
                <option value="customers">Customers</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {salesData.map((day, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-sm text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(day[reportType as keyof typeof day] / Math.max(...salesData.map(d => d[reportType as keyof typeof d]))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium text-gray-900">
                  {reportType === 'sales' ? `£${day.sales.toLocaleString()}` : day[reportType as keyof typeof day]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    <span className="text-sm text-gray-500">{product.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{product.sales} sold</span>
                    <span className="text-sm font-medium text-gray-900">£{product.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{method.method}</span>
                    <span className="text-sm text-gray-500">{method.percentage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">${method.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">£{method.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">High sales day</div>
                <div className="text-xs text-gray-500">Revenue exceeded daily target by 25%</div>
              </div>
              <div className="text-xs text-gray-500">2h ago</div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">New customer milestone</div>
                <div className="text-xs text-gray-500">Reached 2,500 registered customers</div>
              </div>
              <div className="text-xs text-gray-500">5h ago</div>
            </div>
            
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Inventory alert</div>
                <div className="text-xs text-gray-500">5 products running low on stock</div>
              </div>
              <div className="text-xs text-gray-500">1d ago</div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Weekly report generated</div>
                <div className="text-xs text-gray-500">Performance summary available</div>
              </div>
              <div className="text-xs text-gray-500">1d ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};