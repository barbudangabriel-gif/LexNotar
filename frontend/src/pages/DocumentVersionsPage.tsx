import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const documentVersionsApi = {
  getVersions: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(
      `${API_BASE_URL}/documents/${documentId}/versions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },
  createVersion: async (documentId: string, file: File, changesSummary?: string) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    if (changesSummary) formData.append('changesSummary', changesSummary);
    
    const { data } = await axios.post(
      `${API_BASE_URL}/documents/${documentId}/versions`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },
  revertToVersion: async (documentId: string, versionId: string) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(
      `${API_BASE_URL}/documents/${documentId}/versions/${versionId}/revert`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },
  deleteVersion: async (documentId: string, versionId: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(
      `${API_BASE_URL}/documents/${documentId}/versions/${versionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

export const DocumentVersionsPage: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changesSummary, setChangesSummary] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: () => documentVersionsApi.getVersions(documentId!),
    enabled: !!documentId,
  });

  const createVersionMutation = useMutation({
    mutationFn: ({ file, summary }: { file: File; summary?: string }) =>
      documentVersionsApi.createVersion(documentId!, file, summary),
    onSuccess: () => {
      toast.success('New version created successfully');
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
      setSelectedFile(null);
      setChangesSummary('');
    },
    onError: () => {
      toast.error('Failed to create version');
    },
  });

  const revertMutation = useMutation({
    mutationFn: (versionId: string) => documentVersionsApi.revertToVersion(documentId!, versionId),
    onSuccess: () => {
      toast.success('Document reverted successfully');
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
    },
    onError: () => {
      toast.error('Failed to revert document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (versionId: string) => documentVersionsApi.deleteVersion(documentId!, versionId),
    onSuccess: () => {
      toast.success('Version deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
    },
    onError: () => {
      toast.error('Failed to delete version');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadVersion = () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    createVersionMutation.mutate({ file: selectedFile, summary: changesSummary });
  };

  const handleRevert = (versionId: string, versionNumber: number) => {
    if (window.confirm(`Are you sure you want to revert to version ${versionNumber}?`)) {
      revertMutation.mutate(versionId);
    }
  };

  const handleDelete = (versionId: string, versionNumber: number) => {
    if (window.confirm(`Are you sure you want to delete version ${versionNumber}?`)) {
      deleteMutation.mutate(versionId);
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      toast.error('You can only compare 2 versions at a time');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Versions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage document version history
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* Upload New Version */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Version</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Changes Summary (optional)
            </label>
            <textarea
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              rows={3}
              placeholder="Describe what changed in this version..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleUploadVersion}
            disabled={!selectedFile || createVersionMutation.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createVersionMutation.isPending ? 'Uploading...' : 'Upload Version'}
          </button>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-md ${
              compareMode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {compareMode ? 'Exit Compare Mode' : 'Compare Versions'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No versions available
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version: any, index: number) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 ${
                  compareMode && selectedVersions.includes(version.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => toggleVersionSelection(version.id)}
                        className="mt-1 h-5 w-5 text-indigo-600 rounded"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          Version {version.versionNumber}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        📄 {version.fileName} ({formatFileSize(version.fileSize)})
                      </p>
                      {version.changesSummary && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{version.changesSummary}"
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          👤 {version.createdBy.firstName} {version.createdBy.lastName}
                        </span>
                        <span>📅 {new Date(version.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!compareMode && index !== 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRevert(version.id, version.versionNumber)}
                        disabled={revertMutation.isPending}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Revert
                      </button>
                      <button
                        onClick={() => handleDelete(version.id, version.versionNumber)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {compareMode && selectedVersions.length === 2 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">
              ℹ️ Comparison mode is simplified in this demo. In production, this would show a detailed diff view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
