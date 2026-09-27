import { api } from '@/lib/api';

export type AssessmentType = 'UNIT_TEST' | 'HALF_YEARLY' | 'ANNUAL' | 'PRACTICAL' | 'PROJECT' | 'OTHER';

export interface Assessment {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  name: string;
  type: AssessmentType;
  maxMarks: number;
  conductedDate: string | null;
  academicYear: string;
  createdAt: string;
  class?: { name: string; division: string | null };
  subject?: { name: string };
  _count?: { academicRecords: number };
}

export interface AcademicRecord {
  id: string;
  schoolId: string;
  studentId: string;
  assessmentId: string;
  marksObtained: number;
  remarks: string | null;
  createdAt: string;
}

export interface StudentAcademicResponse {
  averagePercentage: number | null;
  records: Array<AcademicRecord & { assessment: Assessment }>;
}

export const academicsApi = {
  getAssessments: async (params?: { classId?: string; subjectId?: string }) => {
    const query = new URLSearchParams();
    if (params?.classId) query.append('classId', params.classId);
    if (params?.subjectId) query.append('subjectId', params.subjectId);
    
    const { data } = await api.get<{ success: boolean; data: Assessment[] }>(`/academics/assessments?${query.toString()}`);
    return data.data;
  },

  getAssessmentById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: Assessment }>(`/academics/assessments/${id}`);
    return data.data;
  },

  createAssessment: async (assessmentData: any) => {
    const { data } = await api.post<{ success: boolean; data: Assessment }>('/academics/assessments', assessmentData);
    return data.data;
  },

  getMarksForAssessment: async (assessmentId: string) => {
    const { data } = await api.get<{ success: boolean; data: AcademicRecord[] }>(`/academics/assessments/${assessmentId}/marks`);
    return data.data;
  },

  saveMarks: async (assessmentId: string, records: { studentId: string; marksObtained: number; remarks?: string }[]) => {
    const { data } = await api.post<{ success: boolean; message: string }>(`/academics/assessments/${assessmentId}/marks`, { records });
    return data.message;
  },

  getStudentAcademics: async (studentId: string) => {
    const { data } = await api.get<{ success: boolean; data: StudentAcademicResponse }>(`/academics/student/${studentId}`);
    return data.data;
  }
};
