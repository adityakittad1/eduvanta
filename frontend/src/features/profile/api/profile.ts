import { api } from '@/lib/api';

export interface SchoolFacility {
  id: string;
  name: string;
  description: string | null;
}

export interface SchoolAchievement {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
}

export interface SchoolProfile {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  principalName: string | null;
  description: string | null;
  isActive: boolean;
  facilities: SchoolFacility[];
  achievements: SchoolAchievement[];
  _count: {
    students: number;
    teachers: number;
  };
}

export const profileApi = {
  getSchoolProfile: async () => {
    const { data } = await api.get<{ success: boolean; data: SchoolProfile }>('/profile/school');
    return data.data;
  },

  updateSchoolProfile: async (profileData: Partial<SchoolProfile>) => {
    const { data } = await api.put<{ success: boolean; data: SchoolProfile }>('/profile/school', profileData);
    return data.data;
  },

  addFacility: async (facility: { name: string; description?: string }) => {
    const { data } = await api.post<{ success: boolean; data: SchoolFacility }>('/profile/school/facilities', facility);
    return data.data;
  },

  removeFacility: async (id: string) => {
    await api.delete(`/profile/school/facilities/${id}`);
  },

  addAchievement: async (achievement: { title: string; description?: string; year?: number }) => {
    const { data } = await api.post<{ success: boolean; data: SchoolAchievement }>('/profile/school/achievements', achievement);
    return data.data;
  },

  removeAchievement: async (id: string) => {
    await api.delete(`/profile/school/achievements/${id}`);
  },
};
