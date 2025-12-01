/**
 * =============================================================================
 * HQ DASHBOARD - Multi-Store Management
 * =============================================================================
 * Centralized dashboard for monitoring and managing all retail stores
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Activity,
} from 'lucide-react';

interface StoreData {
  id: string;
  storeCode: string;
  name: string;
  type: string;
  status: string;
  city: string;
  lastSyncAt: string;
  metrics: {
    todaySales: number;
    totalTransactions: number;
    lowStockItems: number;
    activeEmployees: number;
  };
}

interface SyncStatus {
  storeId: string;
  storeName: string;
  lastSync: string;
  status: 'completed' | 'in_progress' | 'failed';
  recordsSynced: number;
}

const HQDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreData[]>([
    {
      id: 'store-001',
      storeCode: 'STR-001',
      name: 'Main Store - New York',
      type: 'Supabase',
      status: 'ACTIVE',
      city: 'New York',
      lastSyncAt: new Date().toISOString(),
      metrics: {
        todaySales: 15420.50,
        totalTransactions: 87,
        lowStockItems: 12,
        activeEmployees: 8,
      },
    },
    {
      id: 'store-002',
      storeCode: 'STR-002',
      name: 'Branch Store - Los Angeles',
      type: 'Supabase',
      status: 'ACTIVE',
      city: 'Los Angeles',
      lastSyncAt: new Date(Date.now() - 300000).toISOString(),
      metrics: {
        todaySales: 12850.75,
        totalTransactions: 64,
        lowStockItems: 8,
        activeEmployees: 6,
      },
    },
    {
      id: 'store-003',
      storeCode: 'STR-003',
      name: 'Third Store - Chicago',
      type: 'eSaletab',
      status: 'ACTIVE',
      city: 'Chicago',
      lastSyncAt: new Date(Date.now() - 600000).toISOString(),
      metrics: {
        todaySales: 18920.25,
        totalTransactions: 102,
        lowStockItems: 15,
        activeEmployees: 10,
      },
    },
  ]);

  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    {
      storeId: 'store-001',
      storeName: 'Main Store',
      lastSync: '2 minutes ago',
      status: 'completed',
      recordsSynced: 245,
    },
    {
      storeId: 'store-002',
      storeName: 'Branch Store',
      lastSync: '5 minutes ago',
      status: 'completed',
      recordsSynced: 189,
    },
    {
      storeId: 'store-003',
      storeName: 'Third Store',
      lastSync: 'In Progress',
      status: 'in_progress',
      recordsSynced: 87,
    },
  ]);

  const [selectedView, setSelectedView] = useState<'overview' | 'stores' | 'sync' | 'transfers' | 'analytics'>('overview');

  // Calculate totals
  const totals = {
    sales: stores.reduce((sum, store) => sum + store.metrics.todaySales, 0),
    transactions: stores.reduce((sum, store) => sum + store.metrics.totalTransactions, 0),
    lowStock: stores.reduce((sum, store) => sum + store.metrics.lowStockItems, 0),
    employees: stores.reduce((sum, store) => sum + store.metrics.activeEmployees, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Store className="w-8 h-8" />
                Multi-Store HQ Dashboard
              </h1>
              <p className="text-blue-100 mt-1">Centralized Management for {stores.length} Retail Stores</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="font-medium">3 Alerts</span>
              </button>
              <button className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors font-medium">
                <RefreshCw className="w-5 h-5" />
                Sync All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'stores', label: 'Stores', icon: Store },
              { id: 'sync', label: 'Sync Status', icon: RefreshCw },
              { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors font-medium ${
                  selectedView === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totals.sales)}</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +12.5% from yesterday
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totals.transactions}</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +8.2% from yesterday
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totals.lowStock}</p>
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Needs attention
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Package className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Employees</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totals.employees}</p>
                    <p className="text-sm text-gray-500 mt-2">Across {stores.length} stores</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Performance Cards */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Store Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{store.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {store.city}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(store.status)}`}>
                          {store.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Today's Sales</span>
                          <span className="font-bold text-gray-900">{formatCurrency(store.metrics.todaySales)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Transactions</span>
                          <span className="font-semibold text-gray-700">{store.metrics.totalTransactions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Low Stock</span>
                          <span className="font-semibold text-orange-600">{store.metrics.lowStockItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Employees</span>
                          <span className="font-semibold text-gray-700">{store.metrics.activeEmployees}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Last Sync</span>
                          <span className="text-gray-700">{new Date(store.lastSyncAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            store.type === 'Supabase' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {store.type}
                          </span>
                          <button className="ml-auto text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Sync Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                Recent Alerts
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Low Stock Alert - Main Store</p>
                    <p className="text-sm text-gray-600">12 items below minimum stock level</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View</button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Sync Completed - All Stores</p>
                    <p className="text-sm text-gray-600">Successfully synced 521 records across 3 stores</p>
                  </div>
                  <span className="text-sm text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <ArrowRightLeft className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Transfer Approved</p>
                    <p className="text-sm text-gray-600">Main Store → Branch Store - 50 items</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Track</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Status Tab */}
        {selectedView === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sync Status</h2>
              <div className="space-y-4">
                {syncStatuses.map((sync) => (
                  <div key={sync.storeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getSyncStatusIcon(sync.status)}
                      <div>
                        <p className="font-semibold text-gray-900">{sync.storeName}</p>
                        <p className="text-sm text-gray-600">Last sync: {sync.lastSync}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{sync.recordsSynced} records</p>
                      <p className="text-sm text-gray-600 capitalize">{sync.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HQDashboard;
