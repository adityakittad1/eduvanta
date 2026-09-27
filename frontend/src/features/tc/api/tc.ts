import { api } from '@/lib/api';

export interface TransferCertificate {
  id: string;
  tcNumber: string;
  reason: string | null;
  status: 'REQUESTED' | 'APPROVED' | 'ISSUED' | 'CANCELLED';
  requestedDate: string;
  approvedDate: string | null;
  issuedDate: string | null;
  fileUrl: string | null;
  student: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class: { name: string; division: string | null } | null;
  };
  approvedBy?: { email: string } | null;
}

export const tcApi = {
  getTcs: async () => {
    const { data } = await api.get<{ success: boolean; data: TransferCertificate[] }>('/tc');
    return data.data;
  },

  requestTc: async (reason?: string) => {
    const { data } = await api.post<{ success: boolean; data: TransferCertificate }>('/tc/request', { reason });
    return data.data;
  },

  requestTcForStudent: async (studentId: string, reason?: string) => {
    const { data } = await api.post<{ success: boolean; data: TransferCertificate }>('/tc/request', { studentId, reason });
    return data.data;
  },

  updateStatus: async (tcId: string, status: 'APPROVED' | 'ISSUED' | 'CANCELLED', fileUrl?: string) => {
    const { data } = await api.patch<{ success: boolean; data: TransferCertificate }>(`/tc/${tcId}/status`, { status, fileUrl });
    return data.data;
  }
};
