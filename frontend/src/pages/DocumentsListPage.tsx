import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentsApi } from '../services/api';

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
  };
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

export const DocumentsListPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, typeFilter, statusFilter, search]);

  const fetchDocuments = async () => {
    try {
      const data = await documentsApi.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.fileName?.toLowerCase().includes(searchLower) ||
        doc.case?.caseNumber.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDocuments(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-200 text-gray-800',
      IN_REVIEW: 'bg-yellow-200 text-yellow-800',
      APPROVED: 'bg-green-200 text-green-800',
      SIGNED: 'bg-blue-200 text-blue-800',
      ARCHIVED: 'bg-gray-400 text-white',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📗';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documente</h1>
        <Link
          to="/documents/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + Încărcare Document
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
        <div>
          <input
            type="text"
            placeholder="Căutare documente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip Document</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="ALL">Toate</option>
              <option value="CONTRACT">Contract</option>
              <option value="DEED">Act Notarial</option>
              <option value="CERTIFICATE">Certificat</option>
              <option value="POWER_OF_ATTORNEY">Procură</option>
              <option value="STATEMENT">Declarație</option>
              <option value="OTHER">Altele</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="ALL">Toate</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">În Revizie</option>
              <option value="APPROVED">Aprobat</option>
              <option value="SIGNED">Semnat</option>
              <option value="ARCHIVED">Arhivat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Documente</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{documents.length}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Draft</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {documents.filter(d => d.status === 'DRAFT').length}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">În Revizie</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {documents.filter(d => d.status === 'IN_REVIEW').length}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Semnate</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">
              {documents.filter(d => d.status === 'SIGNED').length}
            </dd>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {documents.length === 0 
              ? 'Nu există documente. Încărcați primul document!' 
              : 'Nu există documente care să corespundă filtrelor.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <li key={doc.id}>
                <Link to={`/documents/${doc.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-3xl mr-3">{getFileIcon(doc.fileName)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {doc.title}
                          </p>
                          {doc.fileName && (
                            <p className="text-xs text-gray-500 mt-1">{doc.fileName}</p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              {doc.type.replace(/_/g, ' ')}
                            </span>
                            {doc.case && (
                              <span className="flex items-center">
                                📁 <Link 
                                  to={`/cases/${doc.case.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                                >
                                  {doc.case.caseNumber}
                                </Link>
                              </span>
                            )}
                            {doc.fileSize && (
                              <span>{formatFileSize(doc.fileSize)}</span>
                            )}
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
