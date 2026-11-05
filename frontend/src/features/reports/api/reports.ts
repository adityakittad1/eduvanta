import { api } from '@/lib/api';

export interface AttendanceTrendPoint {
  date: string;
  day: string;
  percentage: number;
  present: number;
  absent: number;
}

export interface DashboardNotice {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  warningCount: number;
  todayAttendancePercentage: number | null;
  todayPresentCount: number;
  todayAbsentCount: number;
  attendanceTrends: AttendanceTrendPoint[];
  recentNotices: DashboardNotice[];
}

export const reportsApi = {
  getDashboardStats: async () => {
    const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/reports/dashboard');
    return data.data;
  }
};
