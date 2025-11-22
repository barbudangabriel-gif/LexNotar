export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'NOTAR' | 'ASISTENT' | 'CONTABIL';
  officeId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  officeId: string;
  role?: 'ADMIN' | 'NOTAR' | 'ASISTENT' | 'CONTABIL';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Case {
  id: string;
  caseNumber: string;
  type: string;
  status: string;
  title: string;
  description?: string;
  startDate: string;
  completionDate?: string;
  estimatedValue?: number;
  actualValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  type: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  cnp?: string;
  cui?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  caseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  total: number;
  byStatus?: Record<string, number>;
  byType?: Record<string, number>;
}
