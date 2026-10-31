// ============================================================
// Public Website Service
// Fetches ONLY publicly-safe data — no auth required.
// Dual-path: Uses Prisma with fallback to Supabase REST client.
// ============================================================

import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../lib/logger';

// Resolve school by slug or id — returns schoolId or throws
export async function resolvePublicSchool(slug: string) {
  if (isPrismaAvailable()) {
    try {
      const school = await prisma.school.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
        },
        select: { id: true, isActive: true, isPublicEnabled: true },
      });

      if (school) {
        if (!school.isActive) {
          throw new AppError('School not found', 404, 'NOT_FOUND');
        }
        if (!school.isPublicEnabled) {
          throw new AppError('School website is not publicly available', 403, 'FORBIDDEN');
        }
        return school.id;
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      markPrismaFailure();
      logger.warn('Prisma resolvePublicSchool failed, falling back to Supabase', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('schools')
        .select('id, is_active, is_public_enabled')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (data) {
        if (!data.is_active) {
          throw new AppError('School not found', 404, 'NOT_FOUND');
        }
        if (!data.is_public_enabled) {
          throw new AppError('School website is not publicly available', 403, 'FORBIDDEN');
        }
        return data.id;
      }
    } catch (sbErr: any) {
      if (sbErr instanceof AppError) throw sbErr;
      logger.error('Supabase resolvePublicSchool failed', { error: sbErr?.message });
    }
  }

  throw new AppError('School not found', 404, 'NOT_FOUND');
}

// ─── Public school list (directory) ─────────────────────────

export async function listPublicSchools() {
  if (isPrismaAvailable()) {
    try {
      return await prisma.school.findMany({
        where: { isActive: true, isPublicEnabled: true },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          address: true,
          description: true,
          tagline: true,
          establishedYear: true,
          principalName: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma listPublicSchools failed, falling back to Supabase', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('schools')
        .select('id, name, slug, logo_url, address, description, tagline, established_year, principal_name')
        .eq('is_active', true)
        .eq('is_public_enabled', true)
        .order('name', { ascending: true });

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug || null,
        logoUrl: row.logo_url || null,
        address: row.address || null,
        description: row.description || null,
        tagline: row.tagline || null,
        establishedYear: row.established_year || null,
        principalName: row.principal_name || null,
      }));
    } catch (sbErr: any) {
      logger.error('Supabase listPublicSchools failed', { error: sbErr?.message });
    }
  }

  return [];
}

// ─── Public school profile ────────────────────────────────────

export async function getPublicSchoolProfile(schoolId: string) {
  if (isPrismaAvailable()) {
    try {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          address: true,
          contactPhone: true,
          contactEmail: true,
          principalName: true,
          description: true,
          tagline: true,
          establishedYear: true,
          _count: {
            select: {
              students: { where: { isActive: true } },
              teachers: { where: { isActive: true } },
              classes: { where: { isActive: true } },
            },
          },
        },
      });
      if (school) return school;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma getPublicSchoolProfile failed, falling back to Supabase', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data: row } = await supabase
        .from('schools')
        .select('id, name, slug, logo_url, address, contact_phone, contact_email, principal_name, description, tagline, established_year')
        .eq('id', schoolId)
        .maybeSingle();

      if (row) {
        const [{ count: studentCount }, { count: teacherCount }, { count: classCount }] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
          supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
          supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
        ]);

        return {
          id: row.id,
          name: row.name,
          slug: row.slug || null,
          logoUrl: row.logo_url || null,
          address: row.address || null,
          contactPhone: row.contact_phone || null,
          contactEmail: row.contact_email || null,
          principalName: row.principal_name || null,
          description: row.description || null,
          tagline: row.tagline || null,
          establishedYear: row.established_year || null,
          _count: {
            students: studentCount || 0,
            teachers: teacherCount || 0,
            classes: classCount || 0,
          },
        };
      }
    } catch (sbErr: any) {
      logger.error('Supabase getPublicSchoolProfile failed', { error: sbErr?.message });
    }
  }

  throw new AppError('School not found', 404, 'NOT_FOUND');
}

// ─── Public facilities ────────────────────────────────────────

export async function getPublicFacilities(schoolId: string) {
  if (isPrismaAvailable()) {
    try {
      return await prisma.schoolFacility.findMany({
        where: { schoolId },
        select: { id: true, name: true, description: true, icon: true },
        orderBy: { name: 'asc' },
      });
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('school_facilities')
        .select('id, name, description, icon')
        .eq('school_id', schoolId)
        .order('name', { ascending: true });
      return data || [];
    } catch (sbErr: any) {
      logger.error('Supabase getPublicFacilities failed', { error: sbErr?.message });
    }
  }

  return [];
}

// ─── Public achievements ─────────────────────────────────────

export async function getPublicAchievements(schoolId: string) {
  if (isPrismaAvailable()) {
    try {
      return await prisma.schoolAchievement.findMany({
        where: { schoolId },
        select: { id: true, title: true, description: true, year: true },
        orderBy: [{ year: 'desc' }, { title: 'asc' }],
      });
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('school_achievements')
        .select('id, title, description, year')
        .eq('school_id', schoolId)
        .order('year', { ascending: false });
      return data || [];
    } catch (sbErr: any) {
      logger.error('Supabase getPublicAchievements failed', { error: sbErr?.message });
    }
  }

  return [];
}

// ─── Public gallery ──────────────────────────────────────────

export async function getPublicGallery(schoolId: string, category?: string) {
  if (isPrismaAvailable()) {
    try {
      const where: any = { schoolId, isPublic: true };
      if (category && category !== 'ALL') where.category = category;

      return await prisma.galleryItem.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          fileUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      let query = supabase
        .from('gallery_items')
        .select('id, title, description, category, file_url, created_at')
        .eq('school_id', schoolId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (category && category !== 'ALL') {
        query = query.eq('category', category);
      }

      const { data } = await query;
      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description || null,
        category: row.category,
        fileUrl: row.file_url,
        createdAt: row.created_at,
      }));
    } catch (sbErr: any) {
      logger.error('Supabase getPublicGallery failed', { error: sbErr?.message });
    }
  }

  return [];
}

// ─── Public announcements ────────────────────────────────────

export async function getPublicNotices(schoolId: string) {
  if (isPrismaAvailable()) {
    try {
      return await prisma.notice.findMany({
        where: {
          schoolId,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
        },
        select: {
          id: true,
          title: true,
          content: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('notices')
        .select('id, title, content, published_at, created_at')
        .eq('school_id', schoolId)
        .eq('status', 'PUBLISHED')
        .eq('visibility', 'PUBLIC')
        .order('created_at', { ascending: false })
        .limit(20);

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        publishedAt: row.published_at || null,
        createdAt: row.created_at,
      }));
    } catch (sbErr: any) {
      logger.error('Supabase getPublicNotices failed', { error: sbErr?.message });
    }
  }

  return [];
}

// ─── Public events ────────────────────────────────────────────

export async function getPublicEvents(schoolId: string) {
  if (isPrismaAvailable()) {
    try {
      return await prisma.schoolEvent.findMany({
        where: {
          schoolId,
          isPublic: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          eventDate: true,
        },
        orderBy: { eventDate: 'asc' },
        take: 20,
      });
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('school_events')
        .select('id, title, description, event_date')
        .eq('school_id', schoolId)
        .eq('is_public', true)
        .order('event_date', { ascending: true })
        .limit(20);

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description || null,
        eventDate: row.event_date,
      }));
    } catch (sbErr: any) {
      logger.error('Supabase getPublicEvents failed', { error: sbErr?.message });
    }
  }

  return [];
}

// ─── Full public home page data (single combined call) ───────

export async function getPublicHomePageData(schoolId: string) {
  const [profile, facilities, achievements, gallery, notices, events] = await Promise.all([
    getPublicSchoolProfile(schoolId),
    getPublicFacilities(schoolId),
    getPublicAchievements(schoolId),
    getPublicGallery(schoolId),
    getPublicNotices(schoolId),
    getPublicEvents(schoolId),
  ]);

  return { profile, facilities, achievements, gallery, notices, events };
}
