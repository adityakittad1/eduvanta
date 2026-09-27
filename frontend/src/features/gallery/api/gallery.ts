import { api } from '@/lib/api';

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: 'INFRASTRUCTURE' | 'EVENTS' | 'ACTIVITIES' | 'SPORTS' | 'ACHIEVEMENTS' | 'CULTURAL' | 'EDUCATIONAL';
  fileUrl: string;
  isPublic: boolean;
  createdAt: string;
  uploadedBy: { email: string };
}

export interface UploadGalleryInput {
  title: string;
  description?: string;
  category: string;
  fileUrl: string;
  isPublic?: boolean;
}

export const galleryApi = {
  getGalleryItems: async (): Promise<GalleryItem[]> => {
    const { data } = await api.get<{ success: boolean; data: GalleryItem[] }>('/gallery');
    return data.data;
  },

  uploadItem: async (itemData: UploadGalleryInput): Promise<GalleryItem> => {
    const { data } = await api.post<{ success: boolean; data: GalleryItem }>('/gallery', itemData);
    return data.data;
  },

  togglePublic: async (id: string, isPublic: boolean): Promise<GalleryItem> => {
    const { data } = await api.patch<{ success: boolean; data: GalleryItem }>(`/gallery/${id}`, { isPublic });
    return data.data;
  },
};
