import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  DollarSign, 
  Target, 
  Award, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Filter,
  Search,
  Download,
  Eye,
  Settings,
  UserCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  MapPin,
  Phone,
  Mail,
  Badge,
  Trophy,
  BookOpen,
  Timer,
  Percent
} from 'lucide-react';
import { User, Store, EmployeePerformance, EmployeeAlert, EmployeeGoal } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface EmployeeMonitoringProps {
  user: User;
  stores: Store[];
}

const mockEmployeePerformance: EmployeePerformance[] = [
  {
    id: 'emp-1',
    employeeId: '2',
    employeeName: 'Mike Chen',
    role: 'manager',
    storeId: '1',
    storeName: 'Downtown Store',
    dailyStats: {
      date: '2024-01-15',
      transactionsProcessed: 45,
      totalSales: 3250.00,
      averageTransactionValue: 72.22,
      customersServed: 38,
      hoursWorked: 8.5,
      efficiency: 94,
      accuracy: 98
    },
    weeklyStats: {
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      totalTransactions: 312,
      totalSales: 22400.00,
      totalHours: 42,
      averageEfficiency: 91,
      customerSatisfaction: 4.7,
      goalsAchieved: 3
    },
    monthlyStats: {
      month: 'January',
      year: 2024,
      totalTransactions: 1247,
      totalSales: 89600.00,
      totalHours: 168,
      performanceScore: 93,
      ranking: 2,
      bonusEarned: 850.00,
      trainingCompleted: 4
    },
    lastActive: '2024-01-15T17:30:00Z',
    status: 'active',
    joinDate: '2023-03-15',
    department: 'Sales',
    shift: 'morning'
  },
  {
    id: 'emp-2',
    employeeId: '3',
    employeeName: 'Emily Davis',
    role: 'cashier',
    storeId: '1',
    storeName: 'Downtown Store',
    dailyStats: {
      date: '2024-01-15',
      transactionsProcessed: 67,
      totalSales: 2890.00,
      averageTransactionValue: 43.13,
      customersServed: 52,
      hoursWorked: 8,
      efficiency: 87,
      accuracy: 96
    },
    weeklyStats: {
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      totalTransactions: 456,
      totalSales: 19800.00,
      totalHours: 40,
      averageEfficiency: 89,
      customerSatisfaction: 4.5,
      goalsAchieved: 2
    },
    monthlyStats: {
      month: 'January',
      year: 2024,
      totalTransactions: 1823,
      totalSales: 78900.00,
      totalHours: 160,
      performanceScore: 88,
      ranking: 4,
      bonusEarned: 450.00,
      trainingCompleted: 2
    },
    lastActive: '2024-01-15T18:00:00Z',
    status: 'active',
    joinDate: '2023-06-20',
    department: 'Sales',
    shift: 'afternoon'
  },
  {
    id: 'emp-3',
    employeeId: '4',
    employeeName: 'David Wilson',
    role: 'manager',
    storeId: '2',
    storeName: 'Mall Location',
    dailyStats: {
      date: '2024-01-15',
      transactionsProcessed: 38,
      totalSales: 4120.00,
      averageTransactionValue: 108.42,
      customersServed: 31,
      hoursWorked: 9,
      efficiency: 96,
      accuracy: 99
    },
    weeklyStats: {
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      totalTransactions: 267,
      totalSales: 28900.00,
      totalHours: 45,
      averageEfficiency: 94,
      customerSatisfaction: 4.8,
      goalsAchieved: 4
    },
    monthlyStats: {
      month: 'January',
      year: 2024,
      totalTransactions: 1089,
      totalSales: 115600.00,
      totalHours: 180,
      performanceScore: 96,
      ranking: 1,
      bonusEarned: 1200.00,
      trainingCompleted: 5
    },
    lastActive: '2024-01-15T19:15:00Z',
    status: 'active',
    joinDate: '2022-11-10',
    department: 'Management',
    shift: 'evening'
  },
  {
    id: 'emp-4',
    employeeId: '5',
    employeeName: 'Lisa Wong',
    role: 'cashier',
    storeId: '2',
    storeName: 'Mall Location',
    dailyStats: {
      date: '2024-01-15',
      transactionsProcessed: 52,
      totalSales: 2340.00,
      averageTransactionValue: 45.00,
      customersServed: 48,
      hoursWorked: 7.5,
      efficiency: 82,
      accuracy: 94
    },
    weeklyStats: {
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      totalTransactions: 378,
      totalSales: 16800.00,
      totalHours: 37.5,
      averageEfficiency: 85,
      customerSatisfaction: 4.3,
      goalsAchieved: 1
    },
    monthlyStats: {
      month: 'January',
      year: 2024,
      totalTransactions: 1456,
      totalSales: 65400.00,
      totalHours: 150,
      performanceScore: 84,
      ranking: 6,
      bonusEarned: 320.00,
      trainingCompleted: 1
    },
    lastActive: '2024-01-15T16:45:00Z',
    status: 'offline',
    joinDate: '2023-09-05',
    department: 'Sales',
    shift: 'morning'
  }
];

const mockEmployeeAlerts: EmployeeAlert[] = [
  {
    id: 'alert-1',
    employeeId: '5',
    employeeName: 'Lisa Wong',
    type: 'performance',
    severity: 'medium',
    title: 'Below Target Performance',
    message: 'Employee performance is 15% below monthly target',
    timestamp: '2024-01-15T14:30:00Z',
    isResolved: false,
    actionRequired: true,
    storeId: '2'
  },
  {
    id: 'alert-2',
    employeeId: '3',
    employeeName: 'Emily Davis',
    type: 'goal',
    severity: 'low',
    title: 'Goal Achievement',
    message: 'Successfully completed weekly sales goal',
    timestamp: '2024-01-15T12:00:00Z',
    isResolved: true,
    actionRequired: false,
    storeId: '1'
  },
  {
    id: 'alert-3',
    employeeId: '2',
    employeeName: 'Mike Chen',
    type: 'training',
    severity: 'high',
    title: 'Training Due',
    message: 'Mandatory compliance training expires in 3 days',
    timestamp: '2024-01-15T09:00:00Z',
    isResolved: false,
    actionRequired: true,
    storeId: '1'
  }
];

const mockEmployeeGoals: EmployeeGoal[] = [
  {
    id: 'goal-1',
    employeeId: '3',
    title: 'Daily Transaction Target',
    description: 'Process 60 transactions per day',
    targetValue: 60,
    currentValue: 67,
    unit: 'transactions',
    period: 'daily',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    status: 'completed',
    progress: 112
  },
  {
    id: 'goal-2',
    employeeId: '5',
    title: 'Weekly Sales Target',
    description: 'Achieve £20,000 in weekly sales',
    targetValue: 20000,
    currentValue: 16800,
    unit: '£',
    period: 'weekly',
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    status: 'overdue',
    progress: 84
  },
  {
    id: 'goal-3',
    employeeId: '2',
    title: 'Customer Satisfaction',
    description: 'Maintain 4.5+ customer rating',
    targetValue: 4.5,
    currentValue: 4.7,
    unit: 'rating',
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active',
    progress: 104
  }
];

export const EmployeeMonitoring: React.FC<EmployeeMonitoringProps> = ({ user, stores }) => {
  const [employees, setEmployees] = useState<EmployeePerformance[]>(mockEmployeePerformance);
  const [alerts, setAlerts] = useState<EmployeeAlert[]>(mockEmployeeAlerts);
  const [goals, setGoals] = useState<EmployeeGoal[]>(mockEmployeeGoals);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null);

  const canViewEmployeeData = hasPermission(user, PERMISSIONS.USERS_VIEW);

  if (!canViewEmployeeData || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Admin Access Required</h3>
          <p className="text-gray-500">Employee monitoring is only available to administrators</p>
        </div>
      </div>
    );
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = !selectedStore || emp.storeId === selectedStore;
    const matchesRole = !selectedRole || emp.role === selectedRole;
    return matchesSearch && matchesStore && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'on_break': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'on_break': return <Coffee className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case 'morning': return <Sunrise className="w-4 h-4" />;
      case 'afternoon': return <Sun className="w-4 h-4" />;
      case 'evening': return <Sunset className="w-4 h-4" />;
      case 'night': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-blue-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalSalesToday = employees.reduce((sum, emp) => sum + emp.dailyStats.totalSales, 0);
  const averagePerformance = employees.reduce((sum, emp) => sum + emp.monthlyStats.performanceScore, 0) / employees.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Employee Monitoring & Analytics
          </h1>
          <p className="text-gray-600">Comprehensive employee performance tracking and management</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Employees</p>
              <p className="text-3xl font-bold text-blue-900">{totalEmployees}</p>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600">Across all stores</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active Now</p>
              <p className="text-3xl font-bold text-green-900">{activeEmployees}</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">{Math.round((activeEmployees/totalEmployees)*100)}% online</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Today's Sales</p>
              <p className="text-3xl font-bold text-purple-900">£{totalSalesToday.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <DollarSign className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-sm text-purple-600">By all employees</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-2xl shadow-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Avg Performance</p>
              <p className="text-3xl font-bold text-orange-900">{averagePerformance.toFixed(1)}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600">This month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
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
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Stores</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Employee Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const currentStats = selectedPeriod === 'daily' ? employee.dailyStats :
                              selectedPeriod === 'weekly' ? employee.weeklyStats :
                              employee.monthlyStats;
          
          return (
            <div key={employee.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Employee Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{employee.employeeName}</h3>
                      <p className="text-blue-100 capitalize">{employee.role}</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="text-sm text-blue-100">{employee.storeName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}>
                      {getStatusIcon(employee.status)}
                      <span className="ml-1 capitalize">{employee.status}</span>
                    </span>
                    <div className="flex items-center mt-2 text-blue-100">
                      {getShiftIcon(employee.shift)}
                      <span className="ml-1 text-sm capitalize">{employee.shift} shift</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {selectedPeriod === 'daily' ? currentStats.transactionsProcessed :
                       selectedPeriod === 'weekly' ? currentStats.totalTransactions :
                       currentStats.totalTransactions}
                    </div>
                    <div className="text-sm text-green-600 font-medium">Transactions</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      £{selectedPeriod === 'daily' ? currentStats.totalSales.toLocaleString() :
                          selectedPeriod === 'weekly' ? currentStats.totalSales.toLocaleString() :
                          currentStats.totalSales.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Sales</div>
                  </div>
                </div>

                {selectedPeriod === 'daily' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficiency</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${employee.dailyStats.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{employee.dailyStats.efficiency}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${employee.dailyStats.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{employee.dailyStats.accuracy}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hours Worked</span>
                      <span className="text-sm font-medium text-gray-900">{employee.dailyStats.hoursWorked}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Transaction</span>
                      <span className="text-sm font-medium text-gray-900">£{employee.dailyStats.averageTransactionValue.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {selectedPeriod === 'weekly' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Efficiency</span>
                      <span className="text-sm font-medium text-gray-900">{employee.weeklyStats.averageEfficiency}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{employee.weeklyStats.customerSatisfaction}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Goals Achieved</span>
                      <span className="text-sm font-medium text-gray-900">{employee.weeklyStats.goalsAchieved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Hours</span>
                      <span className="text-sm font-medium text-gray-900">{employee.weeklyStats.totalHours}h</span>
                    </div>
                  </div>
                )}

                {selectedPeriod === 'monthly' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance Score</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${employee.monthlyStats.performanceScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getPerformanceColor(employee.monthlyStats.performanceScore)}`}>
                          {employee.monthlyStats.performanceScore}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ranking</span>
                      <div className="flex items-center">
                        {employee.monthlyStats.ranking <= 3 && <Trophy className="w-4 h-4 text-yellow-500 mr-1" />}
                        <span className="text-sm font-medium text-gray-900">#{employee.monthlyStats.ranking}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bonus Earned</span>
                      <span className="text-sm font-medium text-green-600">£{employee.monthlyStats.bonusEarned.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Training Completed</span>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{employee.monthlyStats.trainingCompleted}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedEmployee(employee)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              Employee Alerts
            </h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge className="w-4 h-4 mr-2" />
                      <span className="font-medium">{alert.employeeName}</span>
                      <span className="ml-2 px-2 py-1 bg-white/50 rounded-full text-xs font-medium">
                        {alert.type}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm">{alert.message}</p>
                    <div className="text-xs mt-2 opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {alert.actionRequired && !alert.isResolved && (
                    <button className="ml-4 px-3 py-1 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                      Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Goals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-green-600" />
              Active Goals
            </h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {employees.find(emp => emp.employeeId === goal.employeeId)?.employeeName}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          goal.progress >= 100 ? 'bg-green-500' :
                          goal.progress >= 80 ? 'bg-blue-500' :
                          goal.progress >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                      <span className={`text-sm font-medium ${
                        goal.progress >= 100 ? 'text-green-600' :
                        goal.progress >= 80 ? 'text-blue-600' :
                        goal.progress >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {goal.progress.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Employee Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Employee Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl text-white">
                  <div className="flex items-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <UserCheck className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold">{selectedEmployee.employeeName}</h4>
                      <p className="text-blue-100 capitalize text-lg">{selectedEmployee.role}</p>
                      <p className="text-blue-100">{selectedEmployee.storeName}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600">Employee ID</div>
                    <div className="font-semibold text-gray-900">{selectedEmployee.employeeId}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600">Department</div>
                    <div className="font-semibold text-gray-900">{selectedEmployee.department}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600">Join Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600">Shift</div>
                    <div className="font-semibold text-gray-900 capitalize flex items-center">
                      {getShiftIcon(selectedEmployee.shift)}
                      <span className="ml-2">{selectedEmployee.shift}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h5>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Monthly Performance</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedEmployee.monthlyStats.performanceScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                          style={{ width: `${selectedEmployee.monthlyStats.performanceScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Daily Efficiency</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedEmployee.dailyStats.efficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                          style={{ width: `${selectedEmployee.dailyStats.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Accuracy Rate</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedEmployee.dailyStats.accuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 h-3 rounded-full"
                          style={{ width: `${selectedEmployee.dailyStats.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-green-700">Monthly Sales</div>
                    <div className="text-2xl font-bold text-green-900">
                      £{selectedEmployee.monthlyStats.totalSales.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm text-blue-700">Ranking</div>
                    <div className="text-2xl font-bold text-blue-900 flex items-center">
                      #{selectedEmployee.monthlyStats.ranking}
                      {selectedEmployee.monthlyStats.ranking <= 3 && (
                        <Trophy className="w-6 h-6 text-yellow-500 ml-2" />
                      )}
                    </div>
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