import { api } from '@/lib/api';

export interface LearningResource {
  id: string;
  title: string;
  topic: string | null;
  description: string | null;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  createdAt: string;
  class: { name: string; division: string | null };
  subject: { name: string };
  teacher: { firstName: string; lastName: string };
}

export const resourcesApi = {
  getResources: async () => {
    const { data } = await api.get<{ success: boolean; data: LearningResource[] }>('/resources');
    return data.data;
  },

  createResource: async (resourceData: any) => {
    const { data } = await api.post<{ success: boolean; data: LearningResource }>('/resources', resourceData);
    return data.data;
  }
};
