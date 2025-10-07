import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store as StoreIcon, User as UserIcon, Lock, ChevronRight, Mail, AlertCircle } from 'lucide-react';
import { User, Store } from '../types';
import { authService, storeService } from '../services';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onStoreSelect: (store: Store) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@retailpos.com', role: 'admin', permissions: [], isActive: true },
  { id: '2', name: 'Mike Chen', email: 'mike@retailpos.com', role: 'manager', storeId: '1', permissions: [], isActive: true },
  { id: '3', name: 'Emily Davis', email: 'emily@retailpos.com', role: 'cashier', storeId: '1', permissions: [], isActive: true },
];

const mockStores: Store[] = [
  {
    id: '1',
    name: 'Downtown Store',
    address: '123 Main St',
    phone: '(555) 123-4567',
    email: 'downtown@retailpos.com',
    status: 'active',
    manager: 'Mike Chen',
    settings: { currency: 'GBP', currencySymbol: '£', taxRate: 20, receiptFooter: '', loyaltyEnabled: true, offlineMode: false },
    hardware: {
      barcodeScanner: { enabled: true, type: 'usb', model: 'Generic' },
      printer: { enabled: true, type: 'thermal', model: 'Generic', paperSize: '80mm' },
      cashDrawer: { enabled: true, type: 'usb', model: 'Generic' },
      cardReader: { enabled: true, type: 'contactless', model: 'Generic' },
      display: { customerDisplay: false, touchScreen: true, size: '15inch' }
    }
  },
  {
    id: '2',
    name: 'Mall Location',
    address: '456 Shopping Center',
    phone: '(555) 987-6543',
    email: 'mall@retailpos.com',
    status: 'active',
    manager: 'Lisa Wong',
    settings: { currency: 'GBP', currencySymbol: '£', taxRate: 20, receiptFooter: '', loyaltyEnabled: true, offlineMode: false },
    hardware: {
      barcodeScanner: { enabled: true, type: 'usb', model: 'Generic' },
      printer: { enabled: true, type: 'thermal', model: 'Generic', paperSize: '80mm' },
      cashDrawer: { enabled: true, type: 'usb', model: 'Generic' },
      cardReader: { enabled: true, type: 'contactless', model: 'Generic' },
      display: { customerDisplay: false, touchScreen: true, size: '15inch' }
    }
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onStoreSelect }) => {
  const [loginMode, setLoginMode] = useState<'demo' | 'real'>('demo');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        handleSuccessfulLogin(user);
      }
    } catch (err) {
      console.log('No existing session');
    }
  };

  const handleSuccessfulLogin = async (user: any) => {
    const formattedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.store_id,
      permissions: [],
      isActive: user.is_active,
      lastLogin: user.last_login,
    };

    onLogin(formattedUser);

    if (user.store_id) {
      try {
        const store = await storeService.getStoreById(user.store_id);
        if (store) {
          const formattedStore: Store = {
            id: store.id,
            name: store.name,
            address: store.address,
            phone: store.phone,
            email: store.email,
            status: store.status,
            manager: store.users?.name || store.manager_id,
            settings: store.store_settings?.[0] || mockStores[0].settings,
            hardware: store.hardware_config?.[0] || mockStores[0].hardware,
          };
          onStoreSelect(formattedStore);
        }
      } catch (err) {
        console.error('Failed to load store:', err);
        onStoreSelect(mockStores[0]);
      }
    } else if (user.role === 'admin') {
      try {
        const stores = await storeService.getAllStores();
        if (stores && stores.length > 0) {
          const firstStore = stores[0];
          const formattedStore: Store = {
            id: firstStore.id,
            name: firstStore.name,
            address: firstStore.address,
            phone: firstStore.phone,
            email: firstStore.email,
            status: firstStore.status,
            manager: firstStore.users?.name || firstStore.manager_id,
            settings: firstStore.store_settings?.[0] || mockStores[0].settings,
            hardware: firstStore.hardware_config?.[0] || mockStores[0].hardware,
          };
          onStoreSelect(formattedStore);
        } else {
          onStoreSelect(mockStores[0]);
        }
      } catch (err) {
        console.error('Failed to load stores:', err);
        onStoreSelect(mockStores[0]);
      }
    }
  };

  const handleDemoLogin = () => {
    if (selectedUser) {
      onLogin(selectedUser);
      if (selectedUser.storeId) {
        const store = mockStores.find(s => s.id === selectedUser.storeId);
        if (store) onStoreSelect(store);
      } else if (selectedUser.role === 'admin') {
        onStoreSelect(mockStores[0]);
      }
    }
  };

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.signIn(email, password);
      if (user) {
        await authService.updateLastLogin(user.id);
        await handleSuccessfulLogin(user);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">BSK Providers</h1>
          <p className="text-gray-600">Enterprise POS System</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setLoginMode('demo'); setError(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              loginMode === 'demo'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Demo Mode
          </button>
          <button
            onClick={() => { setLoginMode('real'); setError(''); setSelectedUser(null); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              loginMode === 'real'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Real Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {loginMode === 'demo' ? (
          !selectedUser ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Demo Profile</h2>
              {mockUsers.map((user) => (
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
              ))}
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
                      placeholder="Any password (demo mode)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleDemoLogin()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Sign In (Demo)
                </button>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Switch User
              </button>
            </div>
          )
        ) : (
          <form onSubmit={handleRealLogin} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Sign In to Your Account</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Don't have an account? Contact your administrator.</p>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <StoreIcon className="w-4 h-4 mr-1" />
            Multi-Store • Cloud Sync • Real-time Data
          </div>
        </div>
      </div>
    </div>
  );
};