import { api } from '@/lib/api';

export type WarningType = 'LOW_ATTENDANCE' | 'LOW_ACADEMIC_PERFORMANCE' | 'DECLINING_PERFORMANCE' | 'LOW_QUIZ_SCORES';

export interface EarlyWarningFlag {
  id: string;
  schoolId: string;
  studentId: string;
  flagType: WarningType;
  details: {
    threshold: number;
    actual: number;
    subject?: string;
  };
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class?: {
      name: string;
      division: string | null;
    };
  };
}

export const earlyWarningApi = {
  getFlags: async (classId?: string) => {
    const url = classId ? `/early-warning?classId=${classId}` : '/early-warning';
    const { data } = await api.get<{ success: boolean; data: EarlyWarningFlag[] }>(url);
    return data.data;
  },

  runEvaluation: async (classId?: string) => {
    const { data } = await api.post<{ success: boolean; message: string; data: { evaluatedCount: number } }>('/early-warning/evaluate', { classId });
    return data;
  }
};
