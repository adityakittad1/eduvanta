import { api } from '@/lib/api';
import { Role } from '@/store/AuthContext';

export interface User {
  id: string;
  email: string;
  role: Role;
  schoolId: string | null;
  isActive: boolean;
  createdAt: string;
  school?: {
    name: string;
  } | null;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: Role }) => {
    const { data } = await api.get<UsersResponse>('/users', { params });
    return data;
  },

  create: async (userData: Partial<User> & { password?: string }) => {
    const { data } = await api.post<{ success: boolean; data: User }>('/users', userData);
    return data.data;
  },

  update: async (id: string, userData: Partial<User> & { password?: string }) => {
    const { data } = await api.put<{ success: boolean; data: User }>(`/users/${id}`, userData);
    return data.data;
  },
};
