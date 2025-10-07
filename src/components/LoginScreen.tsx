import React, { useState } from 'react';
import { ShoppingCart, Store as StoreIcon, User as UserIcon, Lock, ChevronRight } from 'lucide-react';
import { User, Store } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onStoreSelect: (store: Store) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@retailpos.com', role: 'admin' },
  { id: '2', name: 'Mike Chen', email: 'mike@retailpos.com', role: 'manager', storeId: '1' },
  { id: '3', name: 'Emily Davis', email: 'emily@retailpos.com', role: 'cashier', storeId: '1' },
];

const mockStores: Store[] = [
  { id: '1', name: 'Downtown Store', address: '123 Main St', phone: '(555) 123-4567', email: 'downtown@retailpos.com', status: 'active', manager: 'Mike Chen' },
  { id: '2', name: 'Mall Location', address: '456 Shopping Center', phone: '(555) 987-6543', email: 'mall@retailpos.com', status: 'active', manager: 'Lisa Wong' },
  { id: '3', name: 'Westside Branch', address: '789 West Ave', phone: '(555) 456-7890', email: 'westside@retailpos.com', status: 'active', manager: 'Tom Rodriguez' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onStoreSelect }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
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

        {!selectedUser ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Profile</h2>
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