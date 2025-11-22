import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { casesApi, clientsApi } from '../services/api';
import type { Client } from '../types';

const CASE_TYPES = [
  { value: 'VANZARE_CUMPARARE', label: 'Vânzare-Cumpărare' },
  { value: 'DONATIE', label: 'Donație' },
  { value: 'SCHIMB', label: 'Schimb' },
  { value: 'SUCCESIUNE', label: 'Succesiune' },
  { value: 'PROCURA', label: 'Procură' },
  { value: 'TESTAMENT', label: 'Testament' },
  { value: 'CONTRACTE_IMOBILIARE', label: 'Contracte Imobiliare' },
  { value: 'CONTRACTE_COMERCIALE', label: 'Contracte Comerciale' },
  { value: 'CERTIFICARE_SEMNATURA', label: 'Certificare Semnătură' },
  { value: 'ALTE_ACTE', label: 'Alte Acte' },
];

const PARTY_ROLES = {
  VANZARE_CUMPARARE: [
    { value: 'SELLER', label: 'Vânzător' },
    { value: 'BUYER', label: 'Cumpărător' },
  ],
  DONATIE: [
    { value: 'DONOR', label: 'Donator' },
    { value: 'BENEFICIARY', label: 'Beneficiar' },
  ],
  SUCCESIUNE: [
    { value: 'DECEASED', label: 'Defunct' },
    { value: 'HEIR', label: 'Moștenitor' },
  ],
  PROCURA: [
    { value: 'MANDATOR', label: 'Mandant' },
    { value: 'MANDATARY', label: 'Mandatar' },
  ],
  DEFAULT: [
    { value: 'PARTY', label: 'Parte' },
    { value: 'REPRESENTATIVE', label: 'Reprezentant' },
  ],
};

export const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'VANZARE_CUMPARARE',
    title: '',
    description: '',
    estimatedValue: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [parties, setParties] = useState<Array<{ role: string; clientId: string }>>([]);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [selectedPartyRole, setSelectedPartyRole] = useState('');

  useEffect(() => {
    if (searchTerm.length > 2) {
      fetchClients();
    }
  }, [searchTerm]);

  const fetchClients = async () => {
    try {
      const data = await clientsApi.getAll({ search: searchTerm, limit: 20 });
      setClients(data.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const getPartyRoles = () => {
    return PARTY_ROLES[formData.type as keyof typeof PARTY_ROLES] || PARTY_ROLES.DEFAULT;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const caseData = {
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        startDate: formData.startDate,
        parties: parties.length > 0 ? parties : undefined,
      };

      const createdCase = await casesApi.create(caseData);
      toast.success('Dosar creat cu succes!');
      navigate(`/cases/${createdCase.id}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create case';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const addParty = (clientId: string, role: string) => {
    if (!parties.find(p => p.clientId === clientId && p.role === role)) {
      setParties([...parties, { clientId, role }]);
    }
    setShowClientSearch(false);
    setSearchTerm('');
    setSelectedPartyRole('');
  };

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Unknown';
    return client.type === 'INDIVIDUAL'
      ? `${client.firstName} ${client.lastName}`
      : client.companyName || 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Creare Dosar Nou</h1>
        <p className="mt-2 text-sm text-gray-600">
          Completează informațiile de bază pentru deschiderea unui nou dosar notarial
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tip Dosar */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tip Dosar</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip Act *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  setParties([]); // Reset parties when type changes
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {CASE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titlu Dosar *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ex: Vânzare-cumpărare apartament București"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriere
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Detalii suplimentare despre dosar..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Înregistrare
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valoare Estimată (RON)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  placeholder="0.00"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Părți */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Părți Implicate</h2>
            <button
              type="button"
              onClick={() => setShowClientSearch(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Adaugă Parte
            </button>
          </div>

          {/* Lista părți adăugate */}
          {parties.length > 0 ? (
            <ul className="divide-y divide-gray-200 mb-4">
              {parties.map((party, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getClientName(party.clientId)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getPartyRoles().find(r => r.value === party.role)?.label || party.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParty(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Elimină
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              Nu au fost adăugate părți. Adaugă cel puțin o parte implicată în dosar.
            </p>
          )}

          {/* Modal căutare client */}
          {showClientSearch && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adaugă Parte</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol în Dosar
                  </label>
                  <select
                    value={selectedPartyRole}
                    onChange={(e) => setSelectedPartyRole(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selectează rol...</option>
                    {getPartyRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caută Client
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nume, CNP, CUI..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {searchTerm.length > 2 && clients.length > 0 && (
                  <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {clients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => selectedPartyRole && addParty(client.id, selectedPartyRole)}
                        disabled={!selectedPartyRole}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {client.type === 'INDIVIDUAL'
                            ? `${client.firstName} ${client.lastName}`
                            : client.companyName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {client.type === 'INDIVIDUAL' ? client.cnp : client.cui}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClientSearch(false);
                      setSearchTerm('');
                      setSelectedPartyRole('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Anulează
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acțiuni */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Se creează...' : 'Creare Dosar'}
          </button>
        </div>
      </form>
    </div>
  );
};
