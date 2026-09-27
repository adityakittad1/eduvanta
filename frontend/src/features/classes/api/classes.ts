import { api } from '@/lib/api';
import { Teacher } from '../../teachers/api/teachers';
import { Student } from '../../students/api/students';

export interface ClassSubject {
  id: string;
  name: string;
  code: string | null;
  teacherClassSubjects?: {
    id: string;
    teacher: Teacher;
    academicYear: string;
  }[];
}

export interface Class {
  id: string;
  name: string;
  division: string | null;
  academicYear: string;
  _count?: {
    students: number;
    subjects: number;
  };
  subjects?: ClassSubject[];
  students?: Student[];
}

export const classesApi = {
  getClasses: async () => {
    const { data } = await api.get<{ success: boolean; data: Class[] }>('/classes');
    return data.data;
  },

  getClassById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: Class }>(`/classes/${id}`);
    return data.data;
  },

  createClass: async (classData: { name: string; division?: string; academicYear: string }) => {
    const { data } = await api.post<{ success: boolean; data: Class }>('/classes', classData);
    return data.data;
  },

  createSubject: async (classId: string, subjectData: { name: string; code?: string }) => {
    const { data } = await api.post<{ success: boolean; data: ClassSubject }>(`/classes/${classId}/subjects`, subjectData);
    return data.data;
  },

  assignTeacher: async (classId: string, assignmentData: { teacherId: string; subjectId: string; academicYear: string }) => {
    const { data } = await api.post<{ success: boolean; data: any }>(`/classes/${classId}/assign-teacher`, assignmentData);
    return data.data;
  },

  assignStudents: async (classId: string, studentIds: string[]) => {
    const { data } = await api.post<{ success: boolean; message: string }>(`/classes/${classId}/assign-students`, { studentIds });
    return data.message;
  }
};
