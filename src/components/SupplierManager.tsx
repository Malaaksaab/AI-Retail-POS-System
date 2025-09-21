import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { User, Store, Supplier, PurchaseOrder } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface SupplierManagerProps {
  user: User;
  store: Store | null;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'TechWorld Distributors',
    contactPerson: 'James Wilson',
    email: 'james@techworld.com',
    phone: '+44 20 7123 4567',
    address: '123 Tech Street, London, UK',
    paymentTerms: 'Net 30',
    isActive: true,
    products: ['1', '2', '3']
  },
  {
    id: '2',
    name: 'Global Electronics Ltd',
    contactPerson: 'Sarah Chen',
    email: 'sarah@globalelectronics.co.uk',
    phone: '+44 161 234 5678',
    address: '456 Electronics Ave, Manchester, UK',
    paymentTerms: 'Net 15',
    isActive: true,
    products: ['1', '3']
  },
  {
    id: '3',
    name: 'Premium Audio Solutions',
    contactPerson: 'Michael Brown',
    email: 'michael@premiumaudio.com',
    phone: '+44 121 345 6789',
    address: '789 Audio Plaza, Birmingham, UK',
    paymentTerms: 'Net 45',
    isActive: true,
    products: ['3']
  },
  {
    id: '4',
    name: 'Mobile Accessories Direct',
    contactPerson: 'Emma Thompson',
    email: 'emma@mobileaccessories.co.uk',
    phone: '+44 113 456 7890',
    address: '321 Mobile Street, Leeds, UK',
    paymentTerms: 'Net 30',
    isActive: false,
    products: []
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplierId: '1',
    supplierName: 'TechWorld Distributors',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', quantityOrdered: 50, quantityReceived: 50, unitCost: 650.00, total: 32500.00 },
      { productId: '2', productName: 'Samsung Galaxy S24', quantityOrdered: 30, quantityReceived: 30, unitCost: 520.00, total: 15600.00 }
    ],
    subtotal: 48100.00,
    tax: 9620.00,
    total: 57720.00,
    status: 'received',
    orderDate: '2024-01-10',
    expectedDate: '2024-01-15',
    receivedDate: '2024-01-14',
    createdBy: 'Mike Chen',
    storeId: '1'
  },
  {
    id: 'PO-002',
    supplierId: '3',
    supplierName: 'Premium Audio Solutions',
    items: [
      { productId: '3', productName: 'AirPods Pro', quantityOrdered: 100, quantityReceived: 0, unitCost: 160.00, total: 16000.00 }
    ],
    subtotal: 16000.00,
    tax: 3200.00,
    total: 19200.00,
    status: 'sent',
    orderDate: '2024-01-12',
    expectedDate: '2024-01-20',
    createdBy: 'Sarah Johnson',
    storeId: '1'
  }
];

export const SupplierManager: React.FC<SupplierManagerProps> = ({ user, store }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState('suppliers');

  const canViewSuppliers = hasPermission(user, PERMISSIONS.SUPPLIERS_VIEW);
  const canAddSuppliers = hasPermission(user, PERMISSIONS.SUPPLIERS_ADD);
  const canEditSuppliers = hasPermission(user, PERMISSIONS.SUPPLIERS_EDIT);
  const canDeleteSuppliers = hasPermission(user, PERMISSIONS.SUPPLIERS_DELETE);
  const canViewPurchaseOrders = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_VIEW);
  const canCreatePurchaseOrders = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_CREATE);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && supplier.isActive) ||
                         (statusFilter === 'inactive' && !supplier.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleAddSupplier = () => {
    if (!canAddSuppliers) {
      alert('You do not have permission to add suppliers');
      return;
    }
    setShowAddModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    if (!canEditSuppliers) {
      alert('You do not have permission to edit suppliers');
      return;
    }
    setEditingSupplier(supplier);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (!canDeleteSuppliers) {
      alert('You do not have permission to delete suppliers');
      return;
    }
    
    const confirmed = confirm('Are you sure you want to delete this supplier?');
    if (confirmed) {
      setSuppliers(suppliers.filter(s => s.id !== supplierId));
      alert('Supplier deleted successfully');
    }
  };

  const handleCreatePurchaseOrder = (supplierId: string) => {
    if (!canCreatePurchaseOrders) {
      alert('You do not have permission to create purchase orders');
      return;
    }
    alert(`Creating purchase order for supplier ${supplierId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Package className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!canViewSuppliers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view suppliers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage suppliers and purchase orders</p>
        </div>
        <div className="flex items-center space-x-3">
          {canAddSuppliers && (
            <button
              onClick={handleAddSupplier}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Supplier
            </button>
          )}
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
              <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders Value</p>
              <p className="text-2xl font-bold text-gray-900">
                £{purchaseOrders.reduce((sum, po) => sum + po.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="w-4 h-4 mr-2" />
              Suppliers
            </button>
            {canViewPurchaseOrders && (
              <button
                onClick={() => setActiveTab('purchase-orders')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'purchase-orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Purchase Orders
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search suppliers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Suppliers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            supplier.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-3 text-gray-400" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        {supplier.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                        Payment Terms: {supplier.paymentTerms}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Products</span>
                        <span className="text-sm text-gray-500">{supplier.products.length} items</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="flex-1 text-sm bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleCreatePurchaseOrder(supplier.id)}
                          className="flex-1 text-sm bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Package className="w-4 h-4 inline mr-1" />
                          Order
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="text-sm bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'purchase-orders' && canViewPurchaseOrders && (
            <div className="space-y-6">
              {/* Purchase Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.supplierName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.items.length} items</div>
                          <div className="text-xs text-gray-500">
                            {order.items.reduce((sum, item) => sum + item.quantityOrdered, 0)} qty
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">£{order.total.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};