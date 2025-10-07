import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  X,
  CreditCard
} from 'lucide-react';
import { User, Store } from '../types';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name?: string;
  store_id: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
  line_total: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  current_balance?: number;
  payment_terms?: string;
}

interface InvoiceManagementProps {
  user: User;
  store: Store | null;
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ user, store }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: 'Payment due within 30 days',
    discount_amount: 0
  });

  useEffect(() => {
    loadInvoices();
    loadCustomers();
  }, [store]);

  const loadInvoices = () => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoice_number: 'INV-000001',
        customer_id: 'c1',
        customer_name: 'Acme Corporation',
        store_id: store?.id || '1',
        issue_date: '2024-01-10',
        due_date: '2024-02-09',
        subtotal: 5000,
        tax_amount: 425,
        discount_amount: 0,
        total_amount: 5425,
        amount_paid: 5425,
        balance_due: 0,
        status: 'paid',
        notes: 'Regular monthly service',
        terms: 'Payment due within 30 days',
        created_by: user.id,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        invoice_number: 'INV-000002',
        customer_id: 'c2',
        customer_name: 'TechStart Inc',
        store_id: store?.id || '1',
        issue_date: '2024-01-15',
        due_date: '2024-02-14',
        subtotal: 3200,
        tax_amount: 272,
        discount_amount: 100,
        total_amount: 3372,
        amount_paid: 1500,
        balance_due: 1872,
        status: 'sent',
        notes: 'First installment received',
        terms: 'Net 30',
        created_by: user.id,
        created_at: '2024-01-15T11:00:00Z',
        updated_at: '2024-01-20T09:15:00Z'
      },
      {
        id: '3',
        invoice_number: 'INV-000003',
        customer_id: 'c3',
        customer_name: 'Global Solutions Ltd',
        store_id: store?.id || '1',
        issue_date: '2024-01-05',
        due_date: '2024-02-04',
        subtotal: 7500,
        tax_amount: 637.50,
        discount_amount: 200,
        total_amount: 7937.50,
        amount_paid: 0,
        balance_due: 7937.50,
        status: 'overdue',
        notes: 'Payment overdue - follow up required',
        terms: 'Payment due within 30 days',
        created_by: user.id,
        created_at: '2024-01-05T15:00:00Z',
        updated_at: '2024-01-05T15:00:00Z'
      }
    ];
    setInvoices(mockInvoices);
  };

  const loadCustomers = () => {
    const mockCustomers: Customer[] = [
      { id: 'c1', name: 'Acme Corporation', email: 'billing@acme.com', phone: '(555) 100-0001', current_balance: 0, payment_terms: 'Net 30' },
      { id: 'c2', name: 'TechStart Inc', email: 'accounts@techstart.com', phone: '(555) 200-0002', current_balance: 1872, payment_terms: 'Net 30' },
      { id: 'c3', name: 'Global Solutions Ltd', email: 'finance@global.com', phone: '(555) 300-0003', current_balance: 7937.50, payment_terms: 'Net 30' }
    ];
    setCustomers(mockCustomers);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'sent': return <Send className="w-5 h-5 text-blue-600" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-gray-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceItems([{
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 8.5,
      discount_percent: 0,
      line_total: 0
    }]);
    setFormData({
      customer_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: 'Payment due within 30 days',
      discount_amount: 0
    });
    setEditMode(true);
    setShowInvoiceModal(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditMode(false);
    const mockItems: InvoiceItem[] = [
      {
        id: '1',
        description: 'Professional Services - January',
        quantity: 40,
        unit_price: 125,
        tax_rate: 8.5,
        discount_percent: 0,
        line_total: 5000
      }
    ];
    setInvoiceItems(mockItems);
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditMode(true);
    setFormData({
      customer_id: invoice.customer_id,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      discount_amount: invoice.discount_amount
    });
    const mockItems: InvoiceItem[] = [
      {
        id: '1',
        description: 'Professional Services - January',
        quantity: 40,
        unit_price: 125,
        tax_rate: 8.5,
        discount_percent: 0,
        line_total: 5000
      }
    ];
    setInvoiceItems(mockItems);
    setShowInvoiceModal(true);
  };

  const addLineItem = () => {
    setInvoiceItems([...invoiceItems, {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 8.5,
      discount_percent: 0,
      line_total: 0
    }]);
  };

  const updateLineItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };

    const qty = newItems[index].quantity;
    const price = newItems[index].unit_price;
    const discount = newItems[index].discount_percent;
    newItems[index].line_total = qty * price * (1 - discount / 100);

    setInvoiceItems(newItems);
  };

  const removeLineItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.line_total, 0);
    const taxAmount = invoiceItems.reduce((sum, item) => sum + (item.line_total * item.tax_rate / 100), 0);
    const total = subtotal + taxAmount - formData.discount_amount;
    return { subtotal, taxAmount, total };
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inv.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-600" />
            Invoice Management
          </h1>
          <p className="text-gray-600 mt-1">Create, track, and manage customer invoices</p>
        </div>
        <button
          onClick={handleCreateInvoice}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center font-medium shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Invoiced</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${invoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Amount Paid</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${invoices.reduce((sum, inv) => sum + inv.amount_paid, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Outstanding</span>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${invoices.reduce((sum, inv) => sum + inv.balance_due, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Overdue</span>
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {invoices.filter(inv => inv.status === 'overdue').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Issue Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-medium text-blue-600">{invoice.invoice_number}</span>
                  </td>
                  <td className="py-4 px-4">{invoice.customer_name}</td>
                  <td className="py-4 px-4 text-gray-600">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-gray-600">{new Date(invoice.due_date).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-right font-medium">${invoice.total_amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-medium text-orange-600">${invoice.balance_due.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Send"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editMode ? (selectedInvoice ? 'Edit Invoice' : 'New Invoice') : 'Invoice Details'}
              </h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={selectedInvoice?.invoice_number || 'Auto-generated'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                  {editMode && (
                    <button
                      onClick={addLineItem}
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Line
                    </button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-24">Qty</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-32">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-24">Tax %</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-32">Total</th>
                        {editMode && <th className="w-12"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-3 px-4">
                            {editMode ? (
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                placeholder="Item description"
                              />
                            ) : (
                              <span>{item.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editMode ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-right"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              <span>{item.quantity}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editMode ? (
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-right"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              <span>${item.unit_price.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editMode ? (
                              <input
                                type="number"
                                value={item.tax_rate}
                                onChange={(e) => updateLineItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-right"
                                min="0"
                                step="0.1"
                              />
                            ) : (
                              <span>{item.tax_rate}%</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${item.line_total.toFixed(2)}
                          </td>
                          {editMode && (
                            <td className="py-3 px-4">
                              <button
                                onClick={() => removeLineItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax:</span>
                  <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Discount:</span>
                  {editMode ? (
                    <input
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className="font-medium">-${formData.discount_amount.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    disabled={!editMode}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Payment terms"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={!editMode}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {editMode ? 'Cancel' : 'Close'}
              </button>
              {editMode && (
                <>
                  <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Save & Send
                  </button>
                </>
              )}
              {!editMode && selectedInvoice && selectedInvoice.balance_due > 0 && (
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
