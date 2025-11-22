import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  mimeType,
}) => {
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const isPDF = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');
  const isText = mimeType.startsWith('text/') || mimeType === 'application/json';
  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');
  
  const canPreview = isPDF || isImage || isText || isVideo || isAudio;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (!canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <svg
            className="w-24 h-24 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Download File
          </button>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          <iframe
            src={`${fileUrl}#view=FitH`}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-gray-100">
          {loading && (
            <div className="absolute animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          )}
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-black">
          <video
            src={fileUrl}
            controls
            className="max-w-full max-h-full"
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <svg
            className="w-24 h-24 text-indigo-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <audio
            src={fileUrl}
            controls
            className="w-full max-w-md"
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    if (isText) {
      return (
        <div className="h-full overflow-auto p-6 bg-white">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {fileName}
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                {mimeType}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                📥 Download
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="pt-20 pb-4 px-4 h-full">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};
