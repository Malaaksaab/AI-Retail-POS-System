import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store as StoreIcon, User as UserIcon, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { User, Store } from '../types';
import { auth } from '../services/auth';
import { db } from '../services/database';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onStoreSelect: (store: Store) => void;
}

const demoCredentials = [
  { email: 'admin@retailpos.com', password: 'admin123', role: 'admin' },
  { email: 'manager@retailpos.com', password: 'manager123', role: 'manager' },
  { email: 'cashier@retailpos.com', password: 'cashier123', role: 'cashier' },
];


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onStoreSelect }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storesData, usersData] = await Promise.all([
        db.stores.getAll(),
        db.users.getAll()
      ]);
      setStores(storesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if it's a demo account
      const demoAccount = demoCredentials.find(d => d.email === email && d.password === password);

      if (demoAccount) {
        // Demo login - bypass Supabase auth and use mock user
        const demoUser: User = {
          id: `demo-${demoAccount.role}`,
          email: demoAccount.email,
          name: `${demoAccount.role.charAt(0).toUpperCase() + demoAccount.role.slice(1)} User`,
          role: demoAccount.role as 'admin' | 'manager' | 'cashier',
          storeId: demoAccount.role !== 'admin' && stores.length > 0 ? stores[0].id : undefined,
          isActive: true,
          lastLogin: new Date().toISOString(),
          permissions: [],
          createdAt: new Date().toISOString()
        };

        onLogin(demoUser);

        if (stores.length > 0) {
          onStoreSelect(stores[0]);
        }
      } else {
        // Real authentication with Supabase
        const { user } = await auth.signIn(email, password);
        onLogin(user);

        if (user.storeId) {
          const store = stores.find(s => s.id === user.storeId);
          if (store) onStoreSelect(store);
        } else if (user.role === 'admin' && stores.length > 0) {
          onStoreSelect(stores[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setTimeout(() => {
      handleLogin();
    }, 100);
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

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {demoCredentials.map((demo) => (
              <button
                key={demo.email}
                onClick={() => handleDemoLogin(demo.email, demo.password)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                disabled={loading}
              >
                <div>
                  <div className="text-sm font-medium text-gray-900 capitalize">{demo.role}</div>
                  <div className="text-xs text-gray-500">{demo.email}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};