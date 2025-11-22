import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tasksApi } from '../services/api';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  case?: {
    id: number;
    caseNumber: string;
    title: string;
  };
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export const TasksListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, statusFilter, priorityFilter, showOverdueOnly]);

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (showOverdueOnly) {
      const now = new Date();
      filtered = filtered.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== 'DONE'
      );
    }

    setFilteredTasks(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TODO: 'bg-gray-200 text-gray-800',
      IN_PROGRESS: 'bg-blue-200 text-blue-800',
      DONE: 'bg-green-200 text-green-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-gray-500',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return colors[priority] || 'text-gray-500';
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const handleQuickStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksApi.update(taskId, { status: newStatus as any });
      toast.success('Status actualizat!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Failed to update task status:', error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Task-uri</h1>
        <Link
          to="/tasks/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + Task Nou
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="ALL">Toate</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">În Progres</option>
            <option value="DONE">Finalizat</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioritate</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="ALL">Toate</option>
            <option value="LOW">Scăzută</option>
            <option value="MEDIUM">Medie</option>
            <option value="HIGH">Ridicată</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Doar întârziate</span>
          </label>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{tasks.length}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">TODO</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {tasks.filter(t => t.status === 'TODO').length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">În Progres</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Întârziate</dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">
                  {tasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== 'DONE').length}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {tasks.length === 0 ? 'Nu există task-uri. Creați primul task!' : 'Nu există task-uri care să corespundă filtrelor.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <li key={task.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={task.status === 'DONE'}
                          onChange={(e) => {
                            const newStatus = e.target.checked ? 'DONE' : 'TODO';
                            handleQuickStatusChange(task.id, newStatus);
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <Link to={`/tasks/${task.id}`} className="flex-1">
                          <p className={`text-sm font-medium text-gray-900 ${task.status === 'DONE' ? 'line-through' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{task.description}</p>
                          )}
                        </Link>
                      </div>

                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        {task.case && (
                          <span className="flex items-center">
                            📁 <Link to={`/cases/${task.case.id}`} className="ml-1 text-indigo-600 hover:text-indigo-800">
                              {task.case.caseNumber}
                            </Link>
                          </span>
                        )}
                        {task.assignedTo && (
                          <span>
                            👤 {task.assignedTo.firstName} {task.assignedTo.lastName}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={
                            isOverdue(task.dueDate) && task.status !== 'DONE'
                              ? 'text-red-600 font-medium'
                              : isDueSoon(task.dueDate) && task.status !== 'DONE'
                              ? 'text-orange-600 font-medium'
                              : ''
                          }>
                            📅 {new Date(task.dueDate).toLocaleDateString('ro-RO')}
                            {isOverdue(task.dueDate) && task.status !== 'DONE' && ' (Întârziat)'}
                            {isDueSoon(task.dueDate) && task.status !== 'DONE' && !isOverdue(task.dueDate) && ' (Aproape)'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'LOW' && '↓'}
                        {task.priority === 'MEDIUM' && '→'}
                        {task.priority === 'HIGH' && '↑'}
                        {task.priority === 'URGENT' && '⚠'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status === 'TODO' && 'TODO'}
                        {task.status === 'IN_PROGRESS' && 'În Progres'}
                        {task.status === 'DONE' && 'Finalizat'}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
