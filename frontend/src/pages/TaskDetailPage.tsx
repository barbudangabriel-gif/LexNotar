import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tasksApi } from '../services/api';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const data = await tasksApi.getOne(id!);
      setTask(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await tasksApi.update(task.id, { status: newStatus });
      toast.success('Status actualizat!');
      fetchTaskDetails();
    } catch (err: any) {
      toast.error('Failed to update: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Sigur doriți să ștergeți acest task?')) return;
    
    try {
      await tasksApi.delete(task.id);
      toast.success('Task șters cu succes!');
      if (task.caseId) {
        navigate(`/cases/${task.caseId}`);
      } else {
        navigate('/tasks');
      }
    } catch (err: any) {
      toast.error('Failed to delete: ' + (err.response?.data?.message || 'Unknown error'));
    }
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
      LOW: 'bg-gray-100 text-gray-700',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== 'DONE';
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!task) return <div className="text-center py-12">Task not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <Link to="/tasks" className="text-gray-500 hover:text-gray-700">
                ← Înapoi la Task-uri
              </Link>
            </div>
            <div className="mt-2 flex items-center space-x-3">
              <input
                type="checkbox"
                checked={task.status === 'DONE'}
                onChange={(e) => handleStatusChange(e.target.checked ? 'DONE' : 'TODO')}
                className="h-6 w-6 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <h1 className={`text-3xl font-bold text-gray-900 ${task.status === 'DONE' ? 'line-through' : ''}`}>
                {task.title}
              </h1>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/tasks/${id}/edit`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Editare
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Ștergere
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {task.description && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Descriere</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Associated Case */}
          {task.case && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Dosar Asociat</h2>
              <Link 
                to={`/cases/${task.case.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.case.caseNumber}</p>
                  <p className="text-sm text-gray-600">{task.case.title}</p>
                  {task.case.type && (
                    <p className="text-xs text-gray-500 mt-1">{task.case.type.replace(/_/g, ' ')}</p>
                  )}
                </div>
                <span className="text-indigo-600">→</span>
              </Link>
            </div>
          )}

          {/* Activity / Comments - Placeholder */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Activitate</h2>
            <p className="text-sm text-gray-500">Funcționalitate comentarii - în dezvoltare</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Acțiuni Rapide</h2>
            <div className="space-y-2">
              {task.status !== 'TODO' && (
                <button
                  onClick={() => handleStatusChange('TODO')}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Marchează ca TODO
                </button>
              )}
              {task.status !== 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="w-full text-left px-3 py-2 text-sm border border-blue-300 rounded hover:bg-blue-50 text-blue-700"
                >
                  Începe lucrul
                </button>
              )}
              {task.status !== 'DONE' && (
                <button
                  onClick={() => handleStatusChange('DONE')}
                  className="w-full text-left px-3 py-2 text-sm border border-green-300 rounded hover:bg-green-50 text-green-700"
                >
                  Marchează ca Finalizat
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalii</h2>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status === 'TODO' && 'TODO'}
                    {task.status === 'IN_PROGRESS' && 'În Progres'}
                    {task.status === 'DONE' && 'Finalizat'}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Prioritate</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'LOW' && 'Scăzută'}
                    {task.priority === 'MEDIUM' && 'Medie'}
                    {task.priority === 'HIGH' && 'Ridicată'}
                    {task.priority === 'URGENT' && '⚠ Urgent'}
                  </span>
                </dd>
              </div>

              {task.dueDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Termen Limită</dt>
                  <dd className={`mt-1 text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {new Date(task.dueDate).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {isOverdue(task.dueDate) && (
                      <span className="block text-xs text-red-600 mt-1">⚠ Întârziat</span>
                    )}
                  </dd>
                </div>
              )}

              {task.assignedTo && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Asignat către</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.assignedTo.firstName} {task.assignedTo.lastName}
                  </dd>
                </div>
              )}

              {task.createdBy && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Creat de</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.createdBy.firstName} {task.createdBy.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Timestamps */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Istoric</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Creat la</p>
                <p className="text-gray-900">{new Date(task.createdAt).toLocaleString('ro-RO')}</p>
              </div>
              <div>
                <p className="text-gray-500">Ultima modificare</p>
                <p className="text-gray-900">{new Date(task.updatedAt).toLocaleString('ro-RO')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
