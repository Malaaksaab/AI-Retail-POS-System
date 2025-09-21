import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Store as StoreIcon, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Truck,
  MapPin,
  DollarSign
} from 'lucide-react';
import { User as UserType, Store, InventoryTransfer, TransferItem } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface InventoryTransferProps {
  user: UserType;
  stores: Store[];
}

const mockTransfers: InventoryTransfer[] = [
  {
    id: 'TRF-001',
    fromStoreId: '1',
    toStoreId: '2',
    fromStoreName: 'Downtown Store',
    toStoreName: 'Mall Location',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', quantity: 10, unitCost: 650.00, totalCost: 6500.00 },
      { productId: '2', productName: 'Samsung Galaxy S24', quantity: 5, unitCost: 520.00, totalCost: 2600.00 }
    ],
    status: 'pending',
    requestedBy: 'Mike Chen',
    requestDate: '2024-01-15T10:30:00Z',
    notes: 'Urgent transfer for weekend promotion',
    totalValue: 9100.00
  },
  {
    id: 'TRF-002',
    fromStoreId: '3',
    toStoreId: '1',
    fromStoreName: 'Westside Branch',
    toStoreName: 'Downtown Store',
    items: [
      { productId: '3', productName: 'AirPods Pro', quantity: 20, unitCost: 160.00, totalCost: 3200.00 }
    ],
    status: 'in_transit',
    requestedBy: 'Sarah Johnson',
    approvedBy: 'Admin User',
    requestDate: '2024-01-14T14:20:00Z',
    approvedDate: '2024-01-14T15:30:00Z',
    notes: 'Regular stock balancing',
    totalValue: 3200.00
  },
  {
    id: 'TRF-003',
    fromStoreId: '2',
    toStoreId: '4',
    fromStoreName: 'Mall Location',
    toStoreName: 'North Plaza',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', quantity: 8, unitCost: 650.00, totalCost: 5200.00 },
      { productId: '3', productName: 'AirPods Pro', quantity: 15, unitCost: 160.00, totalCost: 2400.00 }
    ],
    status: 'completed',
    requestedBy: 'Lisa Wong',
    approvedBy: 'Admin User',
    requestDate: '2024-01-13T09:15:00Z',
    approvedDate: '2024-01-13T10:00:00Z',
    completedDate: '2024-01-14T16:45:00Z',
    notes: 'Completed successfully',
    totalValue: 7600.00
  }
];

export const InventoryTransferPage: React.FC<InventoryTransferProps> = ({ user, stores }) => {
  const [transfers, setTransfers] = useState<InventoryTransfer[]>(mockTransfers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<InventoryTransfer | null>(null);

  const canCreateTransfer = hasPermission(user, PERMISSIONS.INVENTORY_TRANSFER);
  const canApproveTransfer = hasPermission(user, PERMISSIONS.INVENTORY_TRANSFER);

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toStoreName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleApproveTransfer = (transferId: string) => {
    if (!canApproveTransfer) {
      alert('You do not have permission to approve transfers');
      return;
    }
    
    setTransfers(transfers.map(t => 
      t.id === transferId 
        ? { 
            ...t, 
            status: 'in_transit' as const, 
            approvedBy: user.name,
            approvedDate: new Date().toISOString()
          }
        : t
    ));
    alert('Transfer approved and is now in transit');
  };

  const handleCompleteTransfer = (transferId: string) => {
    setTransfers(transfers.map(t => 
      t.id === transferId 
        ? { 
            ...t, 
            status: 'completed' as const,
            completedDate: new Date().toISOString()
          }
        : t
    ));
    alert('Transfer marked as completed');
  };

  const handleCancelTransfer = (transferId: string) => {
    const confirmed = confirm('Are you sure you want to cancel this transfer?');
    if (confirmed) {
      setTransfers(transfers.map(t => 
        t.id === transferId ? { ...t, status: 'cancelled' as const } : t
      ));
      alert('Transfer cancelled');
    }
  };

  const totalPendingValue = transfers
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.totalValue, 0);

  const totalInTransitValue = transfers
    .filter(t => t.status === 'in_transit')
    .reduce((sum, t) => sum + t.totalValue, 0);

  if (!canCreateTransfer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to manage inventory transfers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Transfer Management</h1>
          <p className="text-gray-600">Manage stock transfers between store locations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Transfer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{transfers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {transfers.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Value</p>
              <p className="text-2xl font-bold text-gray-900">£{totalPendingValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Transit Value</p>
              <p className="text-2xl font-bold text-gray-900">£{totalInTransitValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transfers by ID or store name..."
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
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{transfer.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{transfer.fromStoreName}</div>
                        <div className="text-gray-500 flex items-center">
                          <ArrowRightLeft className="w-3 h-3 mr-1" />
                          {transfer.toStoreName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transfer.items.length} items</div>
                    <div className="text-sm text-gray-500">
                      {transfer.items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">£{transfer.totalValue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      <span className="ml-1 capitalize">{transfer.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transfer.requestedBy}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transfer.requestDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTransfer(transfer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {transfer.status === 'pending' && canApproveTransfer && (
                        <button
                          onClick={() => handleApproveTransfer(transfer.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Transfer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {transfer.status === 'in_transit' && (
                        <button
                          onClick={() => handleCompleteTransfer(transfer.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Mark Complete"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}
                      {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
                        <button
                          onClick={() => handleCancelTransfer(transfer.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Transfer"
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

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transfer Details</h3>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transfer ID</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransfer.status)}`}>
                    {getStatusIcon(selectedTransfer.status)}
                    <span className="ml-1 capitalize">{selectedTransfer.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Store</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.fromStoreName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Store</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.toStoreName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested By</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.requestedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTransfer.requestDate).toLocaleString()}</p>
                </div>
              </div>

              {selectedTransfer.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTransfer.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Cost</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedTransfer.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">£{item.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">£{item.totalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Transfer Value:</span>
                  <span className="font-bold">£{selectedTransfer.totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};