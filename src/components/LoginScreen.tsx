import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store as StoreIcon, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { User, Store } from '../types';
import { authService, storeService } from '../services';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onStoreSelect: (store: Store) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onStoreSelect }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        await handleSuccessfulLogin(user);
      }
    } catch (err) {
      console.log('No existing session');
    } finally {
      setCheckingSession(false);
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
            settings: store.store_settings?.[0] || {
              currency: 'GBP',
              currencySymbol: '£',
              taxRate: 20,
              receiptFooter: 'Thank you for shopping with us!',
              loyaltyEnabled: true,
              offlineMode: false
            },
            hardware: store.hardware_config?.[0] || {
              barcodeScanner: { enabled: true, type: 'usb', model: 'Generic' },
              printer: { enabled: true, type: 'thermal', model: 'Generic', paperSize: '80mm' },
              cashDrawer: { enabled: true, type: 'usb', model: 'Generic' },
              cardReader: { enabled: true, type: 'contactless', model: 'Generic' },
              display: { customerDisplay: false, touchScreen: true, size: '15inch' }
            }
          };
          onStoreSelect(formattedStore);
        }
      } catch (err) {
        console.error('Failed to load store:', err);
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
            settings: firstStore.store_settings?.[0] || {
              currency: 'GBP',
              currencySymbol: '£',
              taxRate: 20,
              receiptFooter: 'Thank you for shopping with us!',
              loyaltyEnabled: true,
              offlineMode: false
            },
            hardware: firstStore.hardware_config?.[0] || {
              barcodeScanner: { enabled: true, type: 'usb', model: 'Generic' },
              printer: { enabled: true, type: 'thermal', model: 'Generic', paperSize: '80mm' },
              cashDrawer: { enabled: true, type: 'usb', model: 'Generic' },
              cardReader: { enabled: true, type: 'contactless', model: 'Generic' },
              display: { customerDisplay: false, touchScreen: true, size: '15inch' }
            }
          };
          onStoreSelect(formattedStore);
        }
      } catch (err) {
        console.error('Failed to load stores:', err);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.signIn(email, password);
      if (user) {
        await authService.updateLastLogin(user.id);
        await authService.createSession(user.id, user.store_id || '', '');
        await handleSuccessfulLogin(user);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">Need access?</p>
          <p className="text-xs text-gray-500">Contact your system administrator</p>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <StoreIcon className="w-4 h-4 mr-1" />
            Multi-Store • Cloud Sync • Real-time Data
          </div>
        </div>
      </div>
    </div>
  );
};
