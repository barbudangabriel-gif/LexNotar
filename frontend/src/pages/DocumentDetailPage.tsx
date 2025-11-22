import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { documentsApi } from '../services/api';
import { FilePreviewModal } from '../components/FilePreviewModal';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocumentDetails();
    }
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      const data = await documentsApi.getOne(id!);
      setDocument(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document?.filePath) {
      alert('Nu există fișier disponibil pentru descărcare');
      return;
    }

    setDownloading(true);
    try {
      const blob = await documentsApi.downloadFile(id!);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || `document-${id}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Document descărcat!');
    } catch (err: any) {
      toast.error('Failed to download: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Sigur doriți să ștergeți acest document?')) return;
    
    try {
      await documentsApi.delete(id!);
      toast.success('Document șters cu succes!');
      if (document.caseId) {
        navigate(`/cases/${document.caseId}`);
      } else {
        navigate('/documents');
      }
    } catch (err: any) {
      toast.error('Failed to delete: ' + (err.response?.data?.message || 'Unknown error'));
    }
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
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'xls':
      case 'xlsx':
        return '📗';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const canPreview = (fileName?: string): boolean => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!document) return <div className="text-center py-12">Document not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <Link 
                to={document.caseId ? `/cases/${document.caseId}` : '/documents'} 
                className="text-gray-500 hover:text-gray-700"
              >
                ← Înapoi
              </Link>
            </div>
            <div className="mt-2 flex items-center space-x-3">
              <span className="text-4xl">{getFileIcon(document.fileName)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
                {document.fileName && (
                  <p className="text-sm text-gray-500 mt-1">{document.fileName}</p>
                )}
              </div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                {document.status}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            {document.filePath && (
              <>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  👁 Preview
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
                >
                  {downloading ? 'Se descarcă...' : '⬇ Descărcare'}
                </button>
              </>
            )}
            <button
              onClick={() => navigate(`/documents/${id}/edit`)}
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
        {/* Preview Area */}
        <div className="lg:col-span-2">
          {document.filePath && canPreview(document.fileName) ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
              
              {document.fileName?.endsWith('.pdf') ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '800px' }}>
                  <iframe
                    src={`http://localhost:3000/api/v1/documents/${id}/download`}
                    className="w-full h-full"
                    title="Document Preview"
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={`http://localhost:3000/api/v1/documents/${id}/download`}
                    alt={document.title}
                    className="max-w-full h-auto"
                  />
                </div>
              )}
            </div>
          ) : document.filePath ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">{getFileIcon(document.fileName)}</span>
                <p className="text-gray-500 mb-4">
                  Preview nu este disponibil pentru acest tip de fișier
                </p>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-4 py-2 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Descărcați pentru vizualizare
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12 text-gray-500">
                Nu a fost încărcat niciun fișier
              </div>
            </div>
          )}

          {/* Description */}
          {document.description && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Descriere</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{document.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalii</h2>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tip Document</dt>
                <dd className="mt-1 text-sm text-gray-900">{document.type.replace(/_/g, ' ')}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                </dd>
              </div>

              {document.fileSize && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mărime Fișier</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
              )}

              {document.mimeType && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tip MIME</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.mimeType}</dd>
                </div>
              )}

              {document.createdBy && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Încărcat de</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {document.createdBy.firstName} {document.createdBy.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Associated Case */}
          {document.case && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Dosar Asociat</h2>
              <Link 
                to={`/cases/${document.case.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{document.case.caseNumber}</p>
                  <p className="text-sm text-gray-600">{document.case.title}</p>
                </div>
                <span className="text-indigo-600">→</span>
              </Link>
            </div>
          )}

          {/* Signatures */}
          {document.signatures && document.signatures.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Semnături ({document.signatures.length})
              </h2>
              <ul className="space-y-2">
                {document.signatures.map((sig: any) => (
                  <li key={sig.id} className="text-sm">
                    <p className="font-medium text-gray-900">{sig.signerName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sig.signedAt).toLocaleString('ro-RO')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Istoric</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Creat la</p>
                <p className="text-gray-900">{new Date(document.createdAt).toLocaleString('ro-RO')}</p>
              </div>
              <div>
                <p className="text-gray-500">Ultima modificare</p>
                <p className="text-gray-900">{new Date(document.updatedAt).toLocaleString('ro-RO')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {document.filePath && (
        <FilePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileUrl={`http://localhost:3000/api/v1/documents/${id}/download`}
          fileName={document.fileName || document.title}
          mimeType={document.mimeType || 'application/octet-stream'}
        />
      )}
    </div>
  );
};
