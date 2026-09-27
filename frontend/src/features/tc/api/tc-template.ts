import { api } from '@/lib/api';

export interface TcTemplate {
  id: string;
  name: string;
  version: number;
  status: 'ACTIVE' | 'ARCHIVED';
  fileUrl: string;
  createdAt: string;
  activatedAt: string | null;
}

export const tcTemplateApi = {
  getTemplates: async () => {
    const { data } = await api.get<{ success: boolean; data: TcTemplate[] }>('/tc-templates');
    return data.data;
  },

  uploadTemplate: async (name: string, fileUrl: string) => {
    const { data } = await api.post<{ success: boolean; data: TcTemplate }>('/tc-templates', { name, fileUrl });
    return data.data;
  },

  activateTemplate: async (id: string) => {
    const { data } = await api.patch<{ success: boolean; message: string }>(`/tc-templates/${id}/activate`);
    return data;
  },

  archiveTemplate: async (id: string) => {
    const { data } = await api.patch<{ success: boolean; message: string }>(`/tc-templates/${id}/archive`);
    return data;
  },

  generateTc: async (tcId: string) => {
    const { data } = await api.post<{ success: boolean; data: any }>(`/tc-templates/generate/${tcId}`);
    return data.data;
  }
};
