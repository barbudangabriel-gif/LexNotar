import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { templatesApi } from '../services/api';
import toast from 'react-hot-toast';

export const TemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.getAll(),
  });

  const previewMutation = useMutation({
    mutationFn: (data: any) => templatesApi.preview(selectedTemplate.id, data),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      toast.success('Preview generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate preview');
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => templatesApi.generate(selectedTemplate.id, data),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Document generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate document');
    },
  });

  const handleSelectTemplate = async (template: any) => {
    setSelectedTemplate(template);
    setFormData({});
    setPreviewUrl(null);
    
    // Initialize form data with empty values
    const initialData: any = {};
    template.fields.forEach((field: string) => {
      initialData[field] = '';
    });
    setFormData(initialData);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePreview = () => {
    previewMutation.mutate(formData);
  };

  const handleGenerate = () => {
    generateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading templates...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate professional documents from predefined templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Templates</h2>
            <div className="space-y-2">
              {templates.map((template: any) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedTemplate?.id === template.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {template.fields.length} fields
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedTemplate.title}
              </h2>
              
              <div className="space-y-4 mb-6">
                {selectedTemplate.fields.map((field: string) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="text"
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  disabled={previewMutation.isPending}
                  className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {previewMutation.isPending ? 'Generating...' : '👁️ Preview'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {generateMutation.isPending ? 'Generating...' : '📄 Generate PDF'}
                </button>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Preview</h3>
                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px] border-2 border-gray-300 rounded-lg"
                    title="Document Preview"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No template selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a template from the list to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
