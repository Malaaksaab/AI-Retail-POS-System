import React from 'react';
import { Bell, Search, Store as StoreIcon, LogOut, User as UserIcon } from 'lucide-react';
import { User, Store } from '../types';

interface HeaderProps {
  user: User;
  store: Store | null;
  onStoreChange: (store: Store) => void;
  onLogout: () => void;
  theme?: any;
}

export const Header: React.FC<HeaderProps> = ({ user, store, onLogout, theme }) => {
  return (
    <header 
      className="border-b px-6 py-4"
      style={{
        backgroundColor: theme?.colors?.surface || '#ffffff',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderColor: theme?.colors?.border || '#e5e7eb'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: theme?.colors?.textSecondary || '#9ca3af' }}
            />
            <input
              type="text"
              placeholder="Search products, customers, transactions..."
              className="pl-10 pr-4 py-2 w-96 border rounded-xl focus:ring-2 shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{
                borderColor: theme?.colors?.border || '#d1d5db',
                backgroundColor: theme?.colors?.surface || '#ffffff',
                color: theme?.colors?.text || '#1f2937',
                '--tw-ring-color': theme?.colors?.primary || '#2563eb'
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {store && (
            <div 
              className="flex items-center text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200"
              style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
            >
              <StoreIcon 
                className="w-4 h-4 mr-2"
                style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
              />
              <span 
                className="font-medium"
                style={{ color: theme?.colors?.text || '#1f2937' }}
              >
                {store.name}
              </span>
            </div>
          )}

          <button 
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            style={{ 
              color: theme?.colors?.textSecondary || '#9ca3af'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme?.colors?.text || '#6b7280';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme?.colors?.textSecondary || '#9ca3af';
            }}
          >
            <Bell className="w-5 h-5" />
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center shadow-md animate-pulse"
              style={{ backgroundColor: theme?.colors?.error || '#ef4444' }}
            >
              3
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div 
                className="text-sm font-semibold"
                style={{ color: theme?.colors?.text || '#1f2937' }}
              >
                {user.name}
              </div>
              <div 
                className="text-xs capitalize"
                style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
              >
                {user.role}
              </div>
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200"
              style={{ 
                background: `linear-gradient(135deg, ${theme?.colors?.primary || '#2563eb'}, ${theme?.colors?.secondary || '#059669'})`,
                opacity: 0.9
              }}
            >
              <UserIcon 
                className="w-5 h-5 text-white"
              />
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
              style={{ color: theme?.colors?.textSecondary || '#9ca3af' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme?.colors?.error || '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme?.colors?.textSecondary || '#9ca3af';
              }}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};