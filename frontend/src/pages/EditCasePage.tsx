import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'În Progres' },
  { value: 'PENDING_SIGNATURE', label: 'Așteaptă Semnătură' },
  { value: 'COMPLETED', label: 'Finalizat' },
  { value: 'ARCHIVED', label: 'Arhivat' },
  { value: 'CANCELLED', label: 'Anulat' },
];

export const EditCasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    status: 'DRAFT',
    description: '',
    startDate: '',
    completionDate: '',
    estimatedValue: '',
    actualValue: '',
  });

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const data = await casesApi.getOne(id!);
      setFormData({
        title: data.title || '',
        type: data.type || '',
        status: data.status || 'DRAFT',
        description: data.description || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        completionDate: data.completionDate ? new Date(data.completionDate).toISOString().split('T')[0] : '',
        estimatedValue: data.estimatedValue?.toString() || '',
        actualValue: data.actualValue?.toString() || '',
      });
    } catch (err: any) {
      setError('Failed to load case data');
      toast.error('Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.type) {
      setError('Titlul și tipul sunt obligatorii');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        title: formData.title,
        type: formData.type,
        status: formData.status,
      };

      if (formData.description) updateData.description = formData.description;
      if (formData.startDate) updateData.startDate = new Date(formData.startDate).toISOString();
      if (formData.completionDate) updateData.completionDate = new Date(formData.completionDate).toISOString();
      if (formData.estimatedValue) updateData.estimatedValue = parseFloat(formData.estimatedValue);
      if (formData.actualValue) updateData.actualValue = parseFloat(formData.actualValue);

      await casesApi.update(id!, updateData);
      toast.success('Dosar actualizat cu succes!');
      navigate(`/cases/${id}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update case';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editare Dosar</h1>
        <p className="mt-2 text-sm text-gray-600">
          Modificați detaliile dosarului
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informații Generale</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titlu Dosar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Dosar <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Selectați tipul</option>
                {CASE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descriere
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Detalii despre dosar..."
            />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Înregistrare
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Finalizare
              </label>
              <input
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Valori (RON)</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valoare Estimată
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valoare Finală
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.actualValue}
                onChange={(e) => setFormData({ ...formData, actualValue: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/cases/${id}`)}
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
