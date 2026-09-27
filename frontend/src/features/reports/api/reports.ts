import { api } from '@/lib/api';

export interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  warningCount: number;
}

export const reportsApi = {
  getDashboardStats: async () => {
    const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/reports/dashboard');
    return data.data;
  }
};
