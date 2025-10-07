import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store as StoreIcon, User as UserIcon, Lock, ChevronRight } from 'lucide-react';
import { User, Store } from '../types';
import { db } from '../services/database';
import { initializeDemoData } from '../services/initData';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onStoreSelect: (store: Store) => void;
}


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onStoreSelect }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      await initializeDemoData();

      const [usersData, storesData] = await Promise.all([
        db.users.getAll(),
        db.stores.getAll()
      ]);

      const mappedUsers = usersData.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as 'admin' | 'manager' | 'cashier',
        storeId: u.store_id,
        avatar: u.avatar,
        permissions: [],
        isActive: u.is_active,
        lastLogin: u.last_login,
        aiAccess: u.ai_access,
        systemLevel: u.system_level as any
      }));

      const mappedStores = storesData.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        email: s.email,
        status: s.status as 'active' | 'inactive',
        manager: s.manager,
        settings: s.store_settings?.[0] ? {
          currency: s.store_settings[0].currency,
          currencySymbol: s.store_settings[0].currency_symbol,
          taxRate: parseFloat(s.store_settings[0].tax_rate),
          receiptFooter: s.store_settings[0].receipt_footer || '',
          loyaltyEnabled: s.store_settings[0].loyalty_enabled,
          offlineMode: s.store_settings[0].offline_mode
        } : {
          currency: 'USD',
          currencySymbol: '$',
          taxRate: 0,
          receiptFooter: '',
          loyaltyEnabled: true,
          offlineMode: false
        },
        hardware: s.hardware_config?.[0] || {}
      }));

      setUsers(mappedUsers);
      setStores(mappedStores);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (selectedUser) {
      onLogin(selectedUser);
      if (selectedUser.storeId) {
        const store = stores.find(s => s.id === selectedUser.storeId);
        if (store) onStoreSelect(store);
      } else if (selectedUser.role === 'admin' && stores.length > 0) {
        onStoreSelect(stores[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">RetailPOS Pro</h1>
          <p className="text-gray-600">Advanced Cloud-Based POS System</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : !selectedUser ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Profile</h2>
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No users found. Please add users first.</p>
            ) : (
              users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Sign In
              </button>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Switch User
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <StoreIcon className="w-4 h-4 mr-1" />
            Multi-Store • Cloud Sync • Offline Support
          </div>
        </div>
      </div>
    </div>
  );
};