import { api } from '@/lib/api';

export interface Class {
  id: string;
  name: string;
  division: string | null;
  academicYear: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string | null;
}

export interface TeacherClassSubject {
  id: string;
  academicYear: string;
  class: Class;
  subject: Subject;
}

export interface Teacher {
  id: string;
  employeeId: string | null;
  firstName: string;
  lastName: string;
  qualification: string | null;
  isActive: boolean;
  user?: { email: string; isActive: boolean } | null;
  teacherClassSubjects?: TeacherClassSubject[];
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

export const teachersApi = {
  getTeachers: async (page = 1, limit = 50) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const { data } = await api.get<PaginatedResponse<Teacher>>(`/teachers?${params.toString()}`);
    return data;
  },

  getTeacherById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: Teacher }>(`/teachers/${id}`);
    return data.data;
  },

  createTeacher: async (teacherData: Partial<Teacher> & { email: string }) => {
    const { data } = await api.post<{ success: boolean; data: Teacher }>('/teachers', teacherData);
    return data.data;
  },

  updateTeacher: async (id: string, teacherData: Partial<Teacher>) => {
    const { data } = await api.put<{ success: boolean; data: Teacher }>(`/teachers/${id}`, teacherData);
    return data.data;
  },
};
