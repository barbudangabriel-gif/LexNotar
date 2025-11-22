import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clientsApi } from '../services/api';

type ClientType = 'INDIVIDUAL' | 'LEGAL_ENTITY';

export const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientType, setClientType] = useState<ClientType>('INDIVIDUAL');

  const [formData, setFormData] = useState({
    // Individual
    firstName: '',
    lastName: '',
    cnp: '',
    idSeries: '',
    idNumber: '',
    // Legal Entity
    companyName: '',
    cui: '',
    // Common
    email: '',
    phone: '',
    address: '',
    city: '',
    county: '',
  });

  const validateCNP = (cnp: string): boolean => {
    if (cnp.length !== 13) return false;
    return /^\d{13}$/.test(cnp);
  };

  const validateCUI = (cui: string): boolean => {
    if (cui.length < 2 || cui.length > 10) return false;
    return /^\d+$/.test(cui);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validări specifice
    if (clientType === 'INDIVIDUAL') {
      if (formData.cnp && !validateCNP(formData.cnp)) {
        setError('CNP invalid. Trebuie să conțină exact 13 cifre.');
        return;
      }
      if (!formData.firstName || !formData.lastName) {
        setError('Nume și prenume sunt obligatorii pentru persoane fizice.');
        return;
      }
    } else {
      if (!formData.companyName) {
        setError('Denumirea companiei este obligatorie pentru persoane juridice.');
        return;
      }
      if (formData.cui && !validateCUI(formData.cui)) {
        setError('CUI invalid. Trebuie să conțină între 2 și 10 cifre.');
        return;
      }
    }

    setLoading(true);

    try {
      const clientData: any = {
        type: clientType,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        county: formData.county || undefined,
      };

      if (clientType === 'INDIVIDUAL') {
        clientData.firstName = formData.firstName;
        clientData.lastName = formData.lastName;
        clientData.cnp = formData.cnp || undefined;
        clientData.idSeries = formData.idSeries || undefined;
        clientData.idNumber = formData.idNumber || undefined;
      } else {
        clientData.companyName = formData.companyName;
        clientData.cui = formData.cui || undefined;
      }

      const createdClient = await clientsApi.create(clientData);
      toast.success('Client creat cu succes!');
      navigate(`/clients/${createdClient.id}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create client';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Client Nou</h1>
        <p className="mt-2 text-sm text-gray-600">
          Adaugă un client nou în sistem
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tip Client */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tip Client</h2>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setClientType('INDIVIDUAL')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                clientType === 'INDIVIDUAL'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Persoană Fizică
              </div>
            </button>

            <button
              type="button"
              onClick={() => setClientType('LEGAL_ENTITY')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                clientType === 'LEGAL_ENTITY'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Persoană Juridică
              </div>
            </button>
          </div>
        </div>

        {/* Date Identificare */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Identificare</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientType === 'INDIVIDUAL' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prenume *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNP
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={formData.cnp}
                    onChange={(e) => setFormData({ ...formData, cnp: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234567890123"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">13 cifre</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serie CI
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.idSeries}
                      onChange={(e) => setFormData({ ...formData, idSeries: e.target.value.toUpperCase() })}
                      placeholder="AB"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Număr CI
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="123456"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denumire Companie *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="SC EXAMPLE SRL"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CUI
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.cui}
                    onChange={(e) => setFormData({ ...formData, cui: e.target.value.replace(/\D/g, '') })}
                    placeholder="12345678"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">2-10 cifre</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Date Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Contact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+40 712 345 678"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresă
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Str. Exemplu nr. 10, Bl. A, Sc. 1, Ap. 5"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oraș
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="București"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Județ
              </label>
              <input
                type="text"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                placeholder="București"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Acțiuni */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Se salvează...' : 'Salvare Client'}
          </button>
        </div>
      </form>
    </div>
  );
};
