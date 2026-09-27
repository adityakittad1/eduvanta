import { api } from '@/lib/api';

export interface Class {
  id: string;
  name: string;
  division: string | null;
  academicYear: string;
}

export interface EarlyWarningFlag {
  id: string;
  flagType: 'LOW_ATTENDANCE' | 'LOW_ACADEMIC_PERFORMANCE' | 'DECLINING_PERFORMANCE' | 'LOW_QUIZ_SCORES';
  details: any;
  isResolved: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  address: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  academicYear: string;
  isActive: boolean;
  classId: string | null;
  class?: Class | null;
  user?: { email: string; isActive: boolean } | null;
  earlyWarningFlags?: EarlyWarningFlag[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const studentsApi = {
  getStudents: async (page = 1, limit = 50, classId?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(classId ? { classId } : {})
    });
    const { data } = await api.get<PaginatedResponse<Student>>(`/students?${params.toString()}`);
    return data;
  },

  getStudentById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return data.data;
  },

  createStudent: async (studentData: Partial<Student> & { email?: string }) => {
    const { data } = await api.post<{ success: boolean; data: Student }>('/students', studentData);
    return data.data;
  },

  updateStudent: async (id: string, studentData: Partial<Student>) => {
    const { data } = await api.put<{ success: boolean; data: Student }>(`/students/${id}`, studentData);
    return data.data;
  },
};
