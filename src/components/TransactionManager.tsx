import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCw, 
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Printer
} from 'lucide-react';
import { User as UserType, Store, Transaction } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface TransactionManagerProps {
  user: UserType;
  store: Store | null;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    date: '2024-01-15T10:30:00Z',
    customerId: '1',
    customerName: 'John Smith',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', barcode: '123456789', quantity: 1, price: 849.00, total: 849.00 },
      { productId: '3', productName: 'AirPods Pro', barcode: '456789123', quantity: 1, price: 219.00, total: 219.00 }
    ],
    subtotal: 1068.00,
    tax: 213.60,
    discount: 0,
    total: 1281.60,
    paymentMethod: 'card',
    status: 'completed',
    cashierId: '3',
    cashierName: 'Emily Davis',
    storeId: '1',
    basketType: 'permanent',
    receiptNumber: 'RCP001',
    loyaltyPointsEarned: 128
  },
  {
    id: 'TXN-002',
    date: '2024-01-15T11:45:00Z',
    customerId: '2',
    customerName: 'Sarah Wilson',
    items: [
      { productId: '2', productName: 'Samsung Galaxy S24', barcode: '987654321', quantity: 1, price: 699.00, total: 699.00 }
    ],
    subtotal: 699.00,
    tax: 139.80,
    discount: 69.90,
    total: 768.90,
    paymentMethod: 'cash',
    status: 'completed',
    cashierId: '2',
    cashierName: 'Mike Chen',
    storeId: '1',
    basketType: 'permanent',
    receiptNumber: 'RCP002',
    change: 31.10,
    loyaltyPointsEarned: 77
  },
  {
    id: 'TXN-003',
    date: '2024-01-15T14:20:00Z',
    customerName: 'Walk-in Customer',
    items: [
      { productId: '3', productName: 'AirPods Pro', barcode: '456789123', quantity: 2, price: 219.00, total: 438.00 }
    ],
    subtotal: 438.00,
    tax: 87.60,
    discount: 0,
    total: 525.60,
    paymentMethod: 'mobile',
    status: 'completed',
    cashierId: '3',
    cashierName: 'Emily Davis',
    storeId: '1',
    basketType: 'permanent',
    receiptNumber: 'RCP003'
  },
  {
    id: 'TXN-004',
    date: '2024-01-15T16:10:00Z',
    customerId: '1',
    customerName: 'John Smith',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', barcode: '123456789', quantity: 1, price: 849.00, total: 849.00 }
    ],
    subtotal: 849.00,
    tax: 169.80,
    discount: 0,
    total: 1018.80,
    paymentMethod: 'card',
    status: 'refunded',
    cashierId: '2',
    cashierName: 'Mike Chen',
    storeId: '1',
    basketType: 'permanent',
    receiptNumber: 'RCP004',
    reason: 'Customer changed mind'
  },
  {
    id: 'TXN-005',
    date: '2024-01-15T17:30:00Z',
    items: [
      { productId: '2', productName: 'Samsung Galaxy S24', barcode: '987654321', quantity: 1, price: 699.00, total: 699.00 }
    ],
    subtotal: 699.00,
    tax: 139.80,
    discount: 0,
    total: 838.80,
    paymentMethod: 'card',
    status: 'temporary',
    cashierId: '3',
    cashierName: 'Emily Davis',
    storeId: '1',
    basketType: 'temporary',
    receiptNumber: 'TMP005',
    reason: 'Training transaction'
  }
];

export const TransactionManager: React.FC<TransactionManagerProps> = ({ user, store }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const canViewTransactions = hasPermission(user, PERMISSIONS.REPORTS_VIEW);
  const canRefund = hasPermission(user, PERMISSIONS.POS_REFUND);
  const canVoid = hasPermission(user, PERMISSIONS.POS_VOID);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.cashierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || transaction.status === statusFilter;
    const matchesPayment = !paymentFilter || transaction.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      case 'temporary': return 'bg-orange-100 text-orange-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'voided': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'refunded': return <RefreshCw className="w-4 h-4" />;
      case 'temporary': return <Clock className="w-4 h-4" />;
      case 'on_hold': return <AlertTriangle className="w-4 h-4" />;
      case 'voided': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleRefund = (transactionId: string) => {
    if (!canRefund) {
      alert('You do not have permission to process refunds');
      return;
    }
    
    const confirmed = confirm('Are you sure you want to refund this transaction?');
    if (confirmed) {
      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, status: 'refunded' as const } : t
      ));
      alert('Transaction refunded successfully');
    }
  };

  const handleVoid = (transactionId: string) => {
    if (!canVoid) {
      alert('You do not have permission to void transactions');
      return;
    }
    
    const confirmed = confirm('Are you sure you want to void this transaction?');
    if (confirmed) {
      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, status: 'voided' as const } : t
      ));
      alert('Transaction voided successfully');
    }
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    alert(`Printing receipt for ${transaction.receiptNumber}`);
  };

  const totalSales = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalRefunds = filteredTransactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + t.total, 0);

  if (!canViewTransactions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600">View and manage all sales transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">£{totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">£{totalRefunds.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransactions.filter(t => t.status === 'temporary').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
            <option value="temporary">Temporary</option>
            <option value="on_hold">On Hold</option>
            <option value="voided">Voided</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile</option>
            <option value="gift_card">Gift Card</option>
          </select>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{transaction.receiptNumber}</div>
                    <div className="text-sm text-gray-500">{transaction.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customerName || 'Walk-in'}
                        </div>
                        {transaction.loyaltyPointsEarned && (
                          <div className="text-xs text-green-600">
                            +{transaction.loyaltyPointsEarned} points
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.items.length} items</div>
                    <div className="text-xs text-gray-500">
                      {transaction.items.reduce((sum, item) => sum + item.quantity, 0)} qty
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">£{transaction.total.toFixed(2)}</div>
                    {transaction.discount > 0 && (
                      <div className="text-xs text-green-600">-£{transaction.discount.toFixed(2)} discount</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{transaction.paymentMethod}</div>
                    {transaction.change && transaction.change > 0 && (
                      <div className="text-xs text-gray-500">Change: £{transaction.change.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.cashierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(transaction)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {transaction.status === 'completed' && canRefund && (
                        <button
                          onClick={() => handleRefund(transaction.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Refund"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      {transaction.status !== 'voided' && canVoid && (
                        <button
                          onClick={() => handleVoid(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Void"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.receiptNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTransaction.date).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.customerName || 'Walk-in Customer'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cashier</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.cashierName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedTransaction.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">£{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">£{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">£{selectedTransaction.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-green-600">-£{selectedTransaction.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">VAT (20%):</span>
                    <span className="text-sm font-medium">£{selectedTransaction.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">£{selectedTransaction.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};