import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clientsApi } from '../services/api';

type ClientType = 'INDIVIDUAL' | 'LEGAL_ENTITY';

export const EditClientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const data = await clientsApi.getOne(id!);
      setClientType(data.type);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        cnp: data.cnp || '',
        idSeries: data.idSeries || '',
        idNumber: data.idNumber || '',
        companyName: data.companyName || '',
        cui: data.cui || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        county: data.county || '',
      });
    } catch (err: any) {
      setError('Failed to load client data');
      toast.error('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const validateCNP = (cnp: string): boolean => {
    return /^\d{13}$/.test(cnp);
  };

  const validateCUI = (cui: string): boolean => {
    return /^\d{2,10}$/.test(cui);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (clientType === 'INDIVIDUAL') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Prenumele și numele sunt obligatorii');
        return;
      }
      if (formData.cnp && !validateCNP(formData.cnp)) {
        setError('CNP invalid (trebuie să aibă exact 13 cifre)');
        return;
      }
    } else {
      if (!formData.companyName.trim()) {
        setError('Denumirea companiei este obligatorie');
        return;
      }
      if (formData.cui && !validateCUI(formData.cui)) {
        setError('CUI invalid (trebuie să aibă între 2 și 10 cifre)');
        return;
      }
    }

    setSaving(true);
    try {
      const clientData: any = {
        type: clientType,
      };

      if (clientType === 'INDIVIDUAL') {
        clientData.firstName = formData.firstName;
        clientData.lastName = formData.lastName;
        if (formData.cnp) clientData.cnp = formData.cnp;
        if (formData.idSeries) clientData.idSeries = formData.idSeries;
        if (formData.idNumber) clientData.idNumber = formData.idNumber;
      } else {
        clientData.companyName = formData.companyName;
        if (formData.cui) clientData.cui = formData.cui;
      }

      if (formData.email) clientData.email = formData.email;
      if (formData.phone) clientData.phone = formData.phone;
      if (formData.address) clientData.address = formData.address;
      if (formData.city) clientData.city = formData.city;
      if (formData.county) clientData.county = formData.county;

      await clientsApi.update(id!, clientData);
      toast.success('Client actualizat cu succes!');
      navigate(`/clients/${id}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update client';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editare Client</h1>
        <p className="mt-2 text-sm text-gray-600">
          Modificați datele clientului
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Type - Read Only */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Tip Client:</span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              clientType === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {clientType === 'INDIVIDUAL' ? 'Persoană Fizică' : 'Persoană Juridică'}
            </span>
            <span className="text-xs text-gray-500">(nu poate fi modificat)</span>
          </div>
        </div>

        {/* Identification Data */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Identificare</h2>

          {clientType === 'INDIVIDUAL' ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prenume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNP
                </label>
                <input
                  type="text"
                  value={formData.cnp}
                  onChange={(e) => setFormData({ ...formData, cnp: e.target.value })}
                  maxLength={13}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="13 cifre"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serie CI
                  </label>
                  <input
                    type="text"
                    value={formData.idSeries}
                    onChange={(e) => setFormData({ ...formData, idSeries: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ex: RT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Număr CI
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ex: 123456"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Denumire Companie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CUI
                </label>
                <input
                  type="text"
                  value={formData.cui}
                  onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="2-10 cifre"
                />
              </div>
            </>
          )}
        </div>

        {/* Contact Data */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Contact</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresă
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oraș
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Județ
              </label>
              <input
                type="text"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/clients/${id}`)}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anulare
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {saving ? 'Se salvează...' : 'Salvare Modificări'}
          </button>
        </div>
      </form>
    </div>
  );
};
