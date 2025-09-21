import React, { useState } from 'react';
import { Store as StoreIcon, Plus, MapPin, Phone, Mail, Users, Settings } from 'lucide-react';
import { User, Store } from '../types';

interface StoreManagerProps {
  user: User;
}

const mockStores: Store[] = [
  { id: '1', name: 'Downtown Store', address: '123 Main St', phone: '(555) 123-4567', email: 'downtown@retailpos.com', status: 'active', manager: 'Mike Chen' },
  { id: '2', name: 'Mall Location', address: '456 Shopping Center', phone: '(555) 987-6543', email: 'mall@retailpos.com', status: 'active', manager: 'Lisa Wong' },
  { id: '3', name: 'Westside Branch', address: '789 West Ave', phone: '(555) 456-7890', email: 'westside@retailpos.com', status: 'active', manager: 'Tom Rodriguez' },
  { id: '4', name: 'North Plaza', address: '321 North Blvd', phone: '(555) 654-3210', email: 'north@retailpos.com', status: 'inactive', manager: 'Sarah Kim' },
];

export const StoreManager: React.FC<StoreManagerProps> = ({ user }) => {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeStores = stores.filter(s => s.status === 'active').length;
  const totalRevenue = 425600; // Mock data
  const avgPerformance = 87; // Mock data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600">Manage all store locations and operations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Store
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Stores</p>
              <p className="text-2xl font-bold text-gray-900">{activeStores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{avgPerformance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <StoreIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      store.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.status}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  {store.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  {store.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  {store.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-3 text-gray-400" />
                  Manager: {store.manager}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">$42.5K</div>
                    <div className="text-xs text-gray-500">Monthly Revenue</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">156</div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="flex-1 text-sm bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="flex-1 text-sm bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors">
                  Edit Store
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};