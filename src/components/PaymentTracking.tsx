import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Search,
  Download,
  Check,
  X,
  TrendingUp,
  Banknote,
  Building2,
  Wallet,
  Receipt
} from 'lucide-react';
import { User, Store } from '../types';

interface Payment {
  id: string;
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'other';
  reference_number?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  balance_due: number;
  status: string;
}

interface PaymentTrackingProps {
  user: User;
  store: Store | null;
}

export const PaymentTracking: React.FC<PaymentTrackingProps> = ({ user, store }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: 'cash' as Payment['payment_method'],
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadPendingInvoices();
  }, [store]);

  const loadPayments = () => {
    const mockPayments: Payment[] = [
      {
        id: 'p1',
        invoice_id: '1',
        invoice_number: 'INV-000001',
        customer_name: 'Acme Corporation',
        payment_date: '2024-01-15',
        amount: 5425,
        payment_method: 'bank_transfer',
        reference_number: 'TRF20240115001',
        notes: 'Full payment received',
        recorded_by: user.id,
        created_at: '2024-01-15T14:30:00Z'
      },
      {
        id: 'p2',
        invoice_id: '2',
        invoice_number: 'INV-000002',
        customer_name: 'TechStart Inc',
        payment_date: '2024-01-20',
        amount: 1500,
        payment_method: 'check',
        reference_number: 'CHK-789456',
        notes: 'First installment',
        recorded_by: user.id,
        created_at: '2024-01-20T09:15:00Z'
      },
      {
        id: 'p3',
        invoice_id: '4',
        invoice_number: 'INV-000004',
        customer_name: 'Retail Plus',
        payment_date: '2024-01-18',
        amount: 2300,
        payment_method: 'card',
        reference_number: 'CARD-***1234',
        notes: 'Credit card payment',
        recorded_by: user.id,
        created_at: '2024-01-18T11:00:00Z'
      }
    ];
    setPayments(mockPayments);
  };

  const loadPendingInvoices = () => {
    const mockInvoices: Invoice[] = [
      {
        id: '2',
        invoice_number: 'INV-000002',
        customer_name: 'TechStart Inc',
        total_amount: 3372,
        balance_due: 1872,
        status: 'sent'
      },
      {
        id: '3',
        invoice_number: 'INV-000003',
        customer_name: 'Global Solutions Ltd',
        total_amount: 7937.50,
        balance_due: 7937.50,
        status: 'overdue'
      },
      {
        id: '5',
        invoice_number: 'INV-000005',
        customer_name: 'Digital Dynamics',
        total_amount: 4500,
        balance_due: 4500,
        status: 'sent'
      }
    ];
    setPendingInvoices(mockInvoices);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-5 h-5 text-green-600" />;
      case 'card': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'bank_transfer': return <Building2 className="w-5 h-5 text-purple-600" />;
      case 'check': return <Receipt className="w-5 h-5 text-orange-600" />;
      default: return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'bank_transfer': return 'bg-purple-100 text-purple-800';
      case 'check': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      payment_date: new Date().toISOString().split('T')[0],
      amount: invoice.balance_due,
      payment_method: 'cash',
      reference_number: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = () => {
    console.log('Saving payment:', paymentForm);
    setShowPaymentModal(false);
    loadPayments();
    loadPendingInvoices();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalPaymentsToday = payments.filter(p =>
    new Date(p.payment_date).toDateString() === new Date().toDateString()
  ).reduce((sum, p) => sum + p.amount, 0);

  const totalPaymentsMonth = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-green-600" />
            Payment Tracking
          </h1>
          <p className="text-gray-600 mt-1">Record and track customer payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Today's Payments</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalPaymentsToday.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {payments.filter(p => new Date(p.payment_date).toDateString() === new Date().toDateString()).length} transactions
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Month Total</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalPaymentsMonth.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {payments.length} payments
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pending Invoices</span>
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {pendingInvoices.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ${pendingInvoices.reduce((sum, inv) => sum + inv.balance_due, 0).toLocaleString()} due
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Avg Payment</span>
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${payments.length > 0 ? (totalPaymentsMonth / payments.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payments</h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-blue-600">{payment.invoice_number}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{payment.customer_name}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getPaymentMethodColor(payment.payment_method)}`}>
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span className="ml-1 capitalize">{payment.payment_method.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">
                      ${payment.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Invoices</h2>
          <div className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{invoice.customer_name}</div>
                    <div className="text-sm text-gray-500">{invoice.invoice_number}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Balance Due:</span>
                  <span className="text-lg font-bold text-orange-600">
                    ${invoice.balance_due.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleRecordPayment(invoice)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Record Payment
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
              <p className="text-gray-600 mt-1">
                Invoice: {selectedInvoice.invoice_number} - {selectedInvoice.customer_name}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Invoice Total:</span>
                  <span className="font-bold text-gray-900">${selectedInvoice.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-700">Balance Due:</span>
                  <span className="text-xl font-bold text-orange-600">${selectedInvoice.balance_due.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={selectedInvoice.balance_due}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as Payment['payment_method'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                  <input
                    type="text"
                    value={paymentForm.reference_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transaction/Check #"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional payment details..."
                />
              </div>

              {paymentForm.amount >= selectedInvoice.balance_due && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">This payment will close the invoice</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
