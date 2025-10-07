import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { User, Store } from '../types';

interface FinancialReportsProps {
  user: User;
  store: Store | null;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ user, store }) => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');

  const salesData = {
    total: 127450,
    invoiced: 145600,
    paid: 112300,
    outstanding: 33300,
    overdue: 7937.50
  };

  const customerBalances = [
    { name: 'Global Solutions Ltd', balance: 7937.50, overdue: true, invoices: 1 },
    { name: 'TechStart Inc', balance: 1872, overdue: false, invoices: 1 },
    { name: 'Digital Dynamics', balance: 4500, overdue: false, invoices: 1 }
  ];

  const agingReport = {
    current: 18500,
    days30: 6800,
    days60: 1500,
    days90: 4937.50,
    over90: 2062.50
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-purple-600" />
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-1">Sales summaries, balances, and aging reports</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>

      <div className="flex gap-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="sales">Sales Summary</option>
          <option value="balances">Customer Balances</option>
          <option value="aging">Aging Report</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {reportType === 'sales' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Total Invoiced</div>
              <div className="text-2xl font-bold text-gray-900">${salesData.invoiced.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Amount Paid</div>
              <div className="text-2xl font-bold text-green-600">${salesData.paid.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Outstanding</div>
              <div className="text-2xl font-bold text-orange-600">${salesData.outstanding.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Overdue</div>
              <div className="text-2xl font-bold text-red-600">${salesData.overdue.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Collection Rate</div>
              <div className="text-2xl font-bold text-blue-600">
                {((salesData.paid / salesData.invoiced) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="h-64 flex items-end justify-between gap-4">
              {[65, 85, 72, 95, 78, 88, 100, 92, 85, 90, 95, 87].map((height, i) => (
                <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-600">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <span key={i}>{month}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {reportType === 'balances' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Outstanding Balances</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-center py-3 px-4">Invoices</th>
                <th className="text-right py-3 px-4">Balance</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {customerBalances.map((customer, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">{customer.name}</td>
                  <td className="py-4 px-4 text-center">{customer.invoices}</td>
                  <td className="py-4 px-4 text-right font-bold">${customer.balance.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center">
                    {customer.overdue ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs">Overdue</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">Current</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'aging' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Accounts Receivable Aging</h3>
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Current</div>
              <div className="text-xl font-bold text-green-600">${agingReport.current.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">1-30 Days</div>
              <div className="text-xl font-bold text-blue-600">${agingReport.days30.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">31-60 Days</div>
              <div className="text-xl font-bold text-yellow-600">${agingReport.days60.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">61-90 Days</div>
              <div className="text-xl font-bold text-orange-600">${agingReport.days90.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Over 90 Days</div>
              <div className="text-xl font-bold text-red-600">${agingReport.over90.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
