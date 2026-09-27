import { api } from '@/lib/api';

export const aiApi = {
  askQuestion: async (prompt: string) => {
    const { data } = await api.post<{ success: boolean; data: { response: string } }>('/ai/ask', { prompt });
    return data.data.response;
  }
};
