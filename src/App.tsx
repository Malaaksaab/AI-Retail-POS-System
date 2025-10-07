import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { POSTerminal } from './components/POSTerminal';
import { InventoryManager } from './components/InventoryManager';
import { CustomerManager } from './components/CustomerManager';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { StoreManager } from './components/StoreManager';
import { UserManager } from './components/UserManager';
import { Settings } from './components/Settings';
import { TransactionManager } from './components/TransactionManager';
import { SupplierManager } from './components/SupplierManager';
import { CategoryManager } from './components/CategoryManager';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryTransferPage } from './components/InventoryTransfer';
import { EmployeeMonitoring } from './components/EmployeeMonitoring';
import { AdvancedPOSFeatures } from './components/AdvancedPOSFeatures';
import { AdvancedPOSTerminal } from './components/AdvancedPOSTerminal';
import { InvoiceManagement } from './components/InvoiceManagement';
import { PaymentTracking } from './components/PaymentTracking';
import { FinancialReports } from './components/FinancialReports';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { User, Store, Permission } from './types';
import { ROLE_PERMISSIONS } from './utils/permissions';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentTheme, setCurrentTheme] = useState<any>(null);

  // Initialize user permissions when user logs in
  useEffect(() => {
    if (currentUser && !currentUser.permissions) {
      const userPermissions = ROLE_PERMISSIONS[currentUser.role] || [];
      const permissions: Permission[] = [
        {
          module: 'all',
          actions: userPermissions
        }
      ];
      
      setCurrentUser({
        ...currentUser,
        permissions,
        isActive: true,
        lastLogin: new Date().toISOString()
      });
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleStoreSelect = (store: Store) => {
    setCurrentStore(store);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStore(null);
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} onStoreSelect={handleStoreSelect} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        // Show AdminDashboard for admin users, regular Dashboard for others
        if (currentUser.role === 'admin') {
          return <AdminDashboard user={currentUser} stores={[currentStore].filter(Boolean) as Store[]} />;
        }
        return <Dashboard user={currentUser} store={currentStore} />;
      case 'pos':
        return <POSTerminal user={currentUser} store={currentStore} />;
      case 'advanced-pos':
        return <AdvancedPOSTerminal user={currentUser} store={currentStore} stores={[currentStore].filter(Boolean) as Store[]} />;
      case 'inventory':
        return <InventoryManager user={currentUser} store={currentStore} />;
      case 'categories':
        return <CategoryManager user={currentUser} store={currentStore} />;
      case 'customers':
        return <CustomerManager user={currentUser} store={currentStore} />;
      case 'transactions':
        return <TransactionManager user={currentUser} store={currentStore} />;
      case 'reports':
        return <ReportsAnalytics user={currentUser} store={currentStore} />;
      case 'stores':
        return <StoreManager user={currentUser} />;
      case 'users':
        return <UserManager user={currentUser} />;
      case 'suppliers':
        return <SupplierManager user={currentUser} store={currentStore} />;
      case 'settings':
        return <Settings user={currentUser} store={currentStore} />;
      case 'inventory-transfer':
        return <InventoryTransferPage user={currentUser} stores={[currentStore].filter(Boolean) as Store[]} />;
      case 'theme-customizer':
        return <ThemeCustomizer onThemeChange={setCurrentTheme} />;
      case 'employee-monitoring':
        return <EmployeeMonitoring user={currentUser} stores={[currentStore].filter(Boolean) as Store[]} />;
      case 'advanced-features':
        return <AdvancedPOSFeatures user={currentUser} stores={[currentStore].filter(Boolean) as Store[]} />;
      case 'invoices':
        return <InvoiceManagement user={currentUser} store={currentStore} />;
      case 'payments':
        return <PaymentTracking user={currentUser} store={currentStore} />;
      case 'financial-reports':
        return <FinancialReports user={currentUser} store={currentStore} />;
      default:
        return <Dashboard user={currentUser} store={currentStore} />;
    }
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundColor: currentTheme?.colors?.background || '#f8fafc',
        fontFamily: currentTheme?.fonts?.primary || 'Inter, system-ui, sans-serif'
      }}
    >
      <Sidebar 
        user={currentUser} 
        currentView={currentView} 
        onViewChange={setCurrentView}
        theme={currentTheme}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          user={currentUser} 
          store={currentStore} 
          onStoreChange={handleStoreSelect}
          onLogout={handleLogout}
          theme={currentTheme}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;