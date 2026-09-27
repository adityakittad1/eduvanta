import { api } from '@/lib/api';

export interface School {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  principalName: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
    teachers: number;
  };
}

interface SchoolsResponse {
  success: boolean;
  data: School[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const schoolsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<SchoolsResponse>('/schools', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: School }>(`/schools/${id}`);
    return data.data;
  },

  create: async (schoolData: Partial<School>) => {
    const { data } = await api.post<{ success: boolean; data: School }>('/schools', schoolData);
    return data.data;
  },

  update: async (id: string, schoolData: Partial<School>) => {
    const { data } = await api.put<{ success: boolean; data: School }>(`/schools/${id}`, schoolData);
    return data.data;
  },
};
