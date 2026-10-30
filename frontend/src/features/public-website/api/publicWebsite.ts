// ============================================================
// Public Website API client
// No authentication headers — these are public endpoints
// ============================================================

const API_BASE = '/api/v1';

async function publicFetch<T>(endpoint: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/public${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (networkError: any) {
    throw new Error(networkError?.message || 'Network connection failed. Please check your internet connection.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      !response.ok
        ? `Server error (${response.status}): ${errorText.slice(0, 100) || response.statusText}`
        : 'Unexpected non-JSON response from server'
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new Error('Invalid JSON response received from server.');
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
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
