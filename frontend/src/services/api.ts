import api from '../lib/api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export const casesApi = {
  getAll: async (status?: string) => {
    const response = await api.get('/cases', { params: { status } });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/cases', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/cases/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/cases/statistics');
    return response.data;
  },
};

export const clientsApi = {
  getAll: async (params?: { search?: string; type?: string; page?: number; limit?: number }) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/clients/statistics');
    return response.data;
  },
};

export const documentsApi = {
  getAll: async (caseId?: string, status?: string) => {
    const response = await api.get('/documents', { params: { caseId, status } });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/documents', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  uploadFile: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/documents/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (id: string) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/documents/statistics');
    return response.data;
  },
};

export const tasksApi = {
  getAll: async (filters?: { caseId?: number; assignedToId?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId.toString());
    if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  getOverdue: async () => {
    const response = await api.get('/tasks/overdue');
    return response.data;
  },

  getDueSoon: async (days: number = 7) => {
    const response = await api.get(`/tasks/due-soon?days=${days}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`);
  },
};

export const usersApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
};

export const officesApi = {
  getAll: async () => {
    const response = await api.get('/offices');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/offices/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/offices', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/offices/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/offices/${id}`);
  },
};

export const templatesApi = {
  getAll: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  preview: async (id: string, data: any) => {
    const response = await api.post(`/templates/${id}/preview`, data, {
      responseType: 'blob',
    });
    return response.data;
  },

  generate: async (id: string, data: any) => {
    const response = await api.post(`/templates/${id}/generate`, data, {
      responseType: 'blob',
    });
    return response.data;
  },
};
