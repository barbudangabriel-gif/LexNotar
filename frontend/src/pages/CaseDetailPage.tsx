import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { casesApi } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canDeleteEntities, canEditCase } = usePermissions();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const data = await casesApi.getOne(id!);
      setCaseData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-200 text-gray-800',
      IN_PROGRESS: 'bg-blue-200 text-blue-800',
      PENDING_SIGNATURE: 'bg-yellow-200 text-yellow-800',
      COMPLETED: 'bg-green-200 text-green-800',
      ARCHIVED: 'bg-gray-400 text-white',
      CANCELLED: 'bg-red-200 text-red-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const handleDelete = async () => {
    if (!window.confirm('Sigur doriți să ștergeți acest dosar?')) return;
    
    try {
      await casesApi.delete(id!);
      toast.success('Dosar șters cu succes!');
      navigate('/cases');
    } catch (err: any) {
      toast.error('Failed to delete: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!caseData) return <div className="text-center py-12">Case not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Link to="/cases" className="text-gray-500 hover:text-gray-700">
                ← Înapoi
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{caseData.caseNumber}</h1>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
                {caseData.status}
              </span>
            </div>
            <p className="mt-2 text-lg text-gray-600">{caseData.title}</p>
          </div>
          <div className="flex space-x-3">
            {canEditCase(caseData.createdById) && (
              <button
                onClick={() => navigate(`/cases/${id}/edit`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Editare
              </button>
            )}
            {canDeleteEntities() && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Șterge
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalii Dosar */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalii Dosar</h2>
            
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tip</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.type.replace(/_/g, ' ')}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.status}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Data Înregistrare</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(caseData.startDate).toLocaleDateString('ro-RO')}
                </dd>
              </div>

              {caseData.completionDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data Finalizare</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(caseData.completionDate).toLocaleDateString('ro-RO')}
                  </dd>
                </div>
              )}

              {caseData.estimatedValue && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Valoare Estimată</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {parseFloat(caseData.estimatedValue).toLocaleString('ro-RO')} RON
                  </dd>
                </div>
              )}

              {caseData.actualValue && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Valoare Finală</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {parseFloat(caseData.actualValue).toLocaleString('ro-RO')} RON
                  </dd>
                </div>
              )}

              {caseData.createdBy && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Creat de</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {caseData.createdBy.firstName} {caseData.createdBy.lastName}
                  </dd>
                </div>
              )}

              {caseData.assignedTo && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Asignat către</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {caseData.assignedTo.firstName} {caseData.assignedTo.lastName}
                  </dd>
                </div>
              )}
            </dl>

            {caseData.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500 mb-2">Descriere</dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">{caseData.description}</dd>
              </div>
            )}
          </div>

          {/* Părți */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Părți ({caseData.parties?.length || 0})</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                + Adaugă Parte
              </button>
            </div>

            {caseData.parties && caseData.parties.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {caseData.parties.map((party: any) => (
                  <li key={party.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {party.client
                            ? party.client.type === 'INDIVIDUAL'
                              ? `${party.client.firstName} ${party.client.lastName}`
                              : party.client.companyName
                            : 'Client Necunoscut'}
                        </p>
                        <p className="text-sm text-gray-500">{party.role}</p>
                        {party.client && (
                          <p className="text-xs text-gray-400 mt-1">
                            {party.client.type === 'INDIVIDUAL' ? party.client.cnp : party.client.cui}
                          </p>
                        )}
                      </div>
                      {party.client && (
                        <Link
                          to={`/clients/${party.client.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Vezi detalii →
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nu sunt părți adăugate</p>
            )}
          </div>

          {/* Documente */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Documente ({caseData.documents?.length || 0})
              </h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                + Adaugă Document
              </button>
            </div>

            {caseData.documents && caseData.documents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {caseData.documents.map((doc: any) => (
                  <li key={doc.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type} • {new Date(doc.createdAt).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {doc.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nu sunt documente încărcate</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task-uri */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Task-uri ({caseData.tasks?.length || 0})
              </h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                + Adaugă
              </button>
            </div>

            {caseData.tasks && caseData.tasks.length > 0 ? (
              <ul className="space-y-3">
                {caseData.tasks.map((task: any) => (
                  <li key={task.id} className="flex items-start">
                    <input type="checkbox" checked={task.status === 'DONE'} readOnly className="mt-1 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500">
                          Termen: {new Date(task.dueDate).toLocaleDateString('ro-RO')}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nu sunt task-uri</p>
            )}
          </div>

          {/* Istoric */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Istoric</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Creat la</p>
                <p className="text-gray-900">{new Date(caseData.createdAt).toLocaleString('ro-RO')}</p>
              </div>
              <div>
                <p className="text-gray-500">Ultima modificare</p>
                <p className="text-gray-900">{new Date(caseData.updatedAt).toLocaleString('ro-RO')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
