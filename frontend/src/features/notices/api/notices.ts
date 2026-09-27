import { api } from '@/lib/api';

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'CLASS';
  status: 'DRAFT' | 'PUBLISHED';
  visibility: 'INTERNAL' | 'PUBLIC';
  publishedAt: string | null;
  createdAt: string;
  createdBy: { email: string };
  targetClass?: { name: string; division: string | null };
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'CLASS';
  targetClassId?: string;
  visibility?: 'INTERNAL' | 'PUBLIC';
}

export const noticesApi = {
  getNotices: async (): Promise<Notice[]> => {
    const { data } = await api.get<{ success: boolean; data: Notice[] }>('/notices');
    return data.data;
  },

  createNotice: async (noticeData: CreateNoticeInput): Promise<Notice> => {
    const { data } = await api.post<{ success: boolean; data: Notice }>('/notices', noticeData);
    return data.data;
  },
};
