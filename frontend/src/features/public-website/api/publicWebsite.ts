// ============================================================
// Public Website API client
// No authentication headers — these are public endpoints
// ============================================================

const API_BASE = '/api/v1';

async function publicFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}/public${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Request failed');
  }

  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────

export interface PublicSchoolSummary {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  address: string | null;
  description: string | null;
  tagline: string | null;
  establishedYear: number | null;
  principalName: string | null;
}

export interface PublicSchoolProfile extends PublicSchoolSummary {
  contactPhone: string | null;
  contactEmail: string | null;
  _count: {
    students: number;
    teachers: number;
    classes: number;
  };
}

export interface PublicFacility {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface PublicAchievement {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
}

export interface PublicGalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  createdAt: string;
}

export interface PublicNotice {
  id: string;
  title: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
}

export interface PublicHomePageData {
  profile: PublicSchoolProfile;
  facilities: PublicFacility[];
  achievements: PublicAchievement[];
  gallery: PublicGalleryItem[];
  notices: PublicNotice[];
  events: PublicEvent[];
}

// ─── API Functions ────────────────────────────────────────────

export const publicWebsiteApi = {
  listSchools: () => publicFetch<PublicSchoolSummary[]>('/schools'),
  
  getSchoolHomePage: (slug: string) =>
    publicFetch<PublicHomePageData>(`/schools/${slug}`),
  
  getSchoolGallery: (slug: string, category?: string) =>
    publicFetch<PublicGalleryItem[]>(
      `/schools/${slug}/gallery${category ? `?category=${category}` : ''}`
    ),
  
  getSchoolNotices: (slug: string) =>
    publicFetch<PublicNotice[]>(`/schools/${slug}/notices`),
  
  getSchoolEvents: (slug: string) =>
    publicFetch<PublicEvent[]>(`/schools/${slug}/events`),
};
