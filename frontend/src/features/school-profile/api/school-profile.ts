import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────

export interface SchoolFacility {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface SchoolAchievement {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  isPublic: boolean;
}

export interface SchoolProfile {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  principalName: string | null;
  description: string | null;
  tagline: string | null;
  establishedYear: number | null;
  isPublicEnabled: boolean;
  facilities?: SchoolFacility[];
  achievements?: SchoolAchievement[];
  events?: SchoolEvent[];
  _count?: {
    students: number;
    teachers: number;
    classes: number;
  };
}

// ─── API Functions ────────────────────────────────────────────

export const schoolProfileApi = {
  // Profile
  getProfile: async (): Promise<SchoolProfile> => {
    const { data } = await api.get<{ success: boolean; data: SchoolProfile }>('/school-profile');
    return data.data;
  },

  updateProfile: async (profileData: Partial<SchoolProfile>): Promise<SchoolProfile> => {
    const { data } = await api.patch<{ success: boolean; data: SchoolProfile }>('/school-profile', profileData);
    return data.data;
  },

  // Facilities
  getFacilities: async (): Promise<SchoolFacility[]> => {
    const { data } = await api.get<{ success: boolean; data: SchoolFacility[] }>('/school-profile/facilities');
    return data.data;
  },

  createFacility: async (input: { name: string; description?: string; icon?: string }): Promise<SchoolFacility> => {
    const { data } = await api.post<{ success: boolean; data: SchoolFacility }>('/school-profile/facilities', input);
    return data.data;
  },

  deleteFacility: async (id: string): Promise<void> => {
    await api.delete(`/school-profile/facilities/${id}`);
  },

  // Achievements
  getAchievements: async (): Promise<SchoolAchievement[]> => {
    const { data } = await api.get<{ success: boolean; data: SchoolAchievement[] }>('/school-profile/achievements');
    return data.data;
  },

  createAchievement: async (input: { title: string; description?: string; year?: number }): Promise<SchoolAchievement> => {
    const { data } = await api.post<{ success: boolean; data: SchoolAchievement }>('/school-profile/achievements', input);
    return data.data;
  },

  deleteAchievement: async (id: string): Promise<void> => {
    await api.delete(`/school-profile/achievements/${id}`);
  },

  // Events
  getEvents: async (): Promise<SchoolEvent[]> => {
    const { data } = await api.get<{ success: boolean; data: SchoolEvent[] }>('/school-profile/events');
    return data.data;
  },

  createEvent: async (input: { title: string; description?: string; eventDate: string; isPublic?: boolean }): Promise<SchoolEvent> => {
    const { data } = await api.post<{ success: boolean; data: SchoolEvent }>('/school-profile/events', input);
    return data.data;
  },

  updateEvent: async (id: string, input: Partial<SchoolEvent>): Promise<SchoolEvent> => {
    const { data } = await api.patch<{ success: boolean; data: SchoolEvent }>(`/school-profile/events/${id}`, input);
    return data.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/school-profile/events/${id}`);
  },
};
