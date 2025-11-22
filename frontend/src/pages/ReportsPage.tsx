import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { casesApi, clientsApi, tasksApi, documentsApi } from '../services/api';
import * as XLSX from 'xlsx';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState('overview');

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: () => casesApi.getAll(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll(),
  });

  // Filter data by date range
  const filterByDateRange = (items: any[], dateField = 'createdAt') => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return items.filter((item: any) => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredCases = filterByDateRange(cases);
  const filteredClients = filterByDateRange(clients);
  const filteredTasks = filterByDateRange(tasks);

  // Prepare chart data
  const casesByStatus = Object.entries(
    filteredCases.reduce((acc: any, case_: any) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  const casesByType = Object.entries(
    filteredCases.reduce((acc: any, case_: any) => {
      acc[case_.caseType] = (acc[case_.caseType] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  const tasksByPriority = Object.entries(
    filteredTasks.reduce((acc: any, task: any) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const clientsByType = [
    { name: 'Individual', value: filteredClients.filter((c: any) => c.clientType === 'INDIVIDUAL').length },
    { name: 'Legal Entity', value: filteredClients.filter((c: any) => c.clientType === 'LEGAL_ENTITY').length },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Cases Sheet
    const casesData = filteredCases.map((case_: any) => ({
      'Case Number': case_.caseNumber,
      'Title': case_.title,
      'Type': case_.caseType,
      'Status': case_.status,
      'Start Date': new Date(case_.startDate).toLocaleDateString(),
      'Estimated Value': case_.estimatedValue || 'N/A',
    }));
    const casesSheet = XLSX.utils.json_to_sheet(casesData);
    XLSX.utils.book_append_sheet(workbook, casesSheet, 'Cases');

    // Clients Sheet
    const clientsData = filteredClients.map((client: any) => ({
      'Name': client.clientType === 'INDIVIDUAL' ? `${client.firstName} ${client.lastName}` : client.companyName,
      'Type': client.clientType,
      'Email': client.email || 'N/A',
      'Phone': client.phoneNumber || 'N/A',
      'CNP/CUI': client.cnp || client.cui || 'N/A',
    }));
    const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clients');

    // Tasks Sheet
    const tasksData = filteredTasks.map((task: any) => ({
      'Title': task.title,
      'Status': task.status,
      'Priority': task.priority,
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
      'Assigned To': task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned',
    }));
    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');

    // Statistics Sheet
    const statsData = [
      { Metric: 'Total Cases', Value: filteredCases.length },
      { Metric: 'Total Clients', Value: filteredClients.length },
      { Metric: 'Total Tasks', Value: filteredTasks.length },
      { Metric: 'Completed Cases', Value: filteredCases.filter((c: any) => c.status === 'COMPLETED').length },
      { Metric: 'Pending Tasks', Value: filteredTasks.filter((t: any) => t.status === 'TODO').length },
    ];
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');

    // Export
    XLSX.writeFile(workbook, `LexNotar-Report-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`);
    toast.success('Report exported successfully!');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Advanced analytics and customizable reports
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="overview">Overview</option>
              <option value="cases">Cases Analysis</option>
              <option value="clients">Clients Analysis</option>
              <option value="tasks">Tasks Analysis</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={exportToExcel}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📊 Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Cases</div>
          <div className="text-3xl font-bold text-indigo-600">{filteredCases.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Clients</div>
          <div className="text-3xl font-bold text-green-600">{filteredClients.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Tasks</div>
          <div className="text-3xl font-bold text-purple-600">{filteredTasks.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Completion Rate</div>
          <div className="text-3xl font-bold text-amber-600">
            {filteredCases.length > 0
              ? Math.round((filteredCases.filter((c: any) => c.status === 'COMPLETED').length / filteredCases.length) * 100)
              : 0}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cases by Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Status</h3>
          {casesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={casesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {casesByStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>

        {/* Cases by Type */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Type</h3>
          {casesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={casesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
          {tasksByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6">
                  {tasksByPriority.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'URGENT' ? '#DC2626' :
                        entry.name === 'HIGH' ? '#EF4444' :
                        entry.name === 'MEDIUM' ? '#F59E0B' : '#10B981'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>

        {/* Clients by Type */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clients by Type</h3>
          {clientsByType.some(c => c.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#8B5CF6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No data available</div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.slice(0, 10).map((case_: any) => (
                <tr key={case_.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {case_.caseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {case_.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {case_.caseType?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      case_.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      case_.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {case_.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(case_.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-gray-500">No cases found in this date range</div>
          )}
        </div>
      </div>
    </div>
  );
};
