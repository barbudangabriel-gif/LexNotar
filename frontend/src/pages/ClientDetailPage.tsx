import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clientsApi } from '../services/api';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      const data = await clientsApi.getOne(id!);
      setClient(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Sigur doriți să ștergeți acest client?')) return;
    
    try {
      await clientsApi.delete(id!);
      toast.success('Client șters cu succes!');
      navigate('/clients');
    } catch (err: any) {
      toast.error('Failed to delete: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!client) return <div className="text-center py-12">Client not found</div>;

  const clientName = client.type === 'INDIVIDUAL'
    ? `${client.firstName} ${client.lastName}`
    : client.companyName;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Link to="/clients" className="text-gray-500 hover:text-gray-700">
                ← Înapoi
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{clientName}</h1>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                client.type === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {client.type === 'INDIVIDUAL' ? 'Persoană Fizică' : 'Persoană Juridică'}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/clients/${id}/edit`)}
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
          {/* Date Identificare */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Date Identificare</h2>
            
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {client.type === 'INDIVIDUAL' ? (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Prenume</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.firstName}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nume</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.lastName}</dd>
                  </div>

                  {client.cnp && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">CNP</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.cnp}</dd>
                    </div>
                  )}

                  {(client.idSeries || client.idNumber) && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Carte Identitate</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {client.idSeries} {client.idNumber}
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Denumire</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.companyName}</dd>
                  </div>

                  {client.cui && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">CUI</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.cui}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>

          {/* Date Contact */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Date Contact</h2>
            
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {client.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${client.email}`} className="text-indigo-600 hover:text-indigo-800">
                      {client.email}
                    </a>
                  </dd>
                </div>
              )}

              {client.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${client.phone}`} className="text-indigo-600 hover:text-indigo-800">
                      {client.phone}
                    </a>
                  </dd>
                </div>
              )}

              {client.address && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Adresă</dt>
                  <dd className="mt-1 text-sm text-gray-900">{client.address}</dd>
                </div>
              )}

              {client.city && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Oraș</dt>
                  <dd className="mt-1 text-sm text-gray-900">{client.city}</dd>
                </div>
              )}

              {client.county && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Județ</dt>
                  <dd className="mt-1 text-sm text-gray-900">{client.county}</dd>
                </div>
              )}
            </dl>

            {!client.email && !client.phone && !client.address && !client.city && !client.county && (
              <p className="text-sm text-gray-500">Nu sunt date de contact disponibile</p>
            )}
          </div>

          {/* Dosare Asociate */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Dosare Asociate ({client.caseParties?.length || 0})
            </h2>

            {client.caseParties && client.caseParties.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {client.caseParties.map((party: any) => (
                  <li key={party.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {party.case.caseNumber} - {party.case.title}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{party.role}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {party.case.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(party.case.createdAt).toLocaleDateString('ro-RO')}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/cases/${party.case.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Vezi →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Acest client nu este asociat cu niciun dosar</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistici Rapide */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Statistici</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Dosare</span>
                <span className="text-lg font-semibold text-gray-900">
                  {client.caseParties?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Client din</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(client.createdAt).toLocaleDateString('ro-RO')}
                </span>
              </div>
            </div>
          </div>

          {/* Istoric */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Istoric</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Creat la</p>
                <p className="text-gray-900">{new Date(client.createdAt).toLocaleString('ro-RO')}</p>
              </div>
              <div>
                <p className="text-gray-500">Ultima modificare</p>
                <p className="text-gray-900">{new Date(client.updatedAt).toLocaleString('ro-RO')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
