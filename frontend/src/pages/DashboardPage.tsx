import React, { useEffect, useState } from 'react';
import { casesApi, clientsApi, documentsApi, tasksApi } from '../services/api';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [casesStats, setCasesStats] = useState<any>(null);
  const [clientsStats, setClientsStats] = useState<any>(null);
  const [documentsStats, setDocumentsStats] = useState<any>(null);
  const [tasksStats, setTasksStats] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cases, clients, documents, tasks, recentCasesData] = await Promise.all([
          casesApi.getStatistics(),
          clientsApi.getStatistics(),
          documentsApi.getStatistics(),
          tasksApi.getAll(),
          casesApi.getAll(),
        ]);
        setCasesStats(cases);
        setClientsStats(clients);
        setDocumentsStats(documents);
        
        // Calculate task statistics
        const tasksByStatus = tasks.reduce((acc: any, task: any) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});
        
        const tasksByPriority = tasks.reduce((acc: any, task: any) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {});
        
        setTasksStats({ total: tasks.length, byStatus: tasksByStatus, byPriority: tasksByPriority });
        
        // Get 5 most recent cases
        setRecentCases(recentCasesData.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Prepare data for charts
  const casesByStatus = Object.entries(casesStats?.byStatus || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  const tasksByPriority = Object.entries(tasksStats?.byPriority || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const documentsByType = Object.entries(documentsStats?.byType || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const PRIORITY_COLORS = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#EF4444', URGENT: '#DC2626' };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Cases"
          value={casesStats?.total || 0}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          link="/cases"
          linkText="View all cases"
        />

        <StatCard
          title="Total Clients"
          value={clientsStats?.total || 0}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          link="/clients"
          linkText="View all clients"
        />

        <StatCard
          title="Total Tasks"
          value={tasksStats?.total || 0}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          link="/tasks"
          linkText="View all tasks"
        />

        <StatCard
          title="Total Documents"
          value={documentsStats?.total || 0}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          link="/documents"
          linkText="View all documents"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
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
            <div className="text-center text-gray-500 py-12">No cases data</div>
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
                <Bar dataKey="value" fill="#4F46E5">
                  {tasksByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#4F46E5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No tasks data</div>
          )}
        </div>

        {/* Documents by Type */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Type</h3>
          {documentsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={documentsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">No documents data</div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Cases</h3>
          {recentCases.length > 0 ? (
            <div className="space-y-3">
              {recentCases.map((case_: any) => (
                <Link
                  key={case_.id}
                  to={`/cases/${case_.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{case_.title}</p>
                      <p className="text-xs text-gray-500">{case_.caseType?.replace(/_/g, ' ')}</p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        case_.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : case_.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {case_.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No recent cases</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Link
            to="/cases/new"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            New Case
          </Link>
          <Link
            to="/clients/new"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            New Client
          </Link>
          <Link
            to="/tasks/new"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            New Task
          </Link>
          <Link
            to="/documents/upload"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Upload Document
          </Link>
        </div>
      </div>
    </div>
  );
};
