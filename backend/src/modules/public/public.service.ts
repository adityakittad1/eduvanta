// ============================================================
// Public Website Service
// Fetches ONLY publicly-safe data — no auth required.
// School isolation enforced by slug → schoolId resolution.
// Private ERP data is NEVER returned from these functions.
// ============================================================

import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

// Resolve school by slug — returns schoolId or throws
export async function resolvePublicSchool(slug: string) {
  const school = await prisma.school.findUnique({
    where: { slug },
    select: { id: true, isActive: true, isPublicEnabled: true },
  });

  if (!school || !school.isActive) {
    throw new AppError('School not found', 404, 'NOT_FOUND');
  }
  if (!school.isPublicEnabled) {
    throw new AppError('School website is not publicly available', 403, 'FORBIDDEN');
  }

  return school.id;
}

// ─── Public school list (directory) ─────────────────────────

export async function listPublicSchools() {
  return prisma.school.findMany({
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
}

// ─── Public school profile ────────────────────────────────────

export async function getPublicSchoolProfile(schoolId: string) {
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
      // Aggregate counts (safe public stats)
      _count: {
        select: {
          students: { where: { isActive: true } },
          teachers: { where: { isActive: true } },
          classes: { where: { isActive: true } },
        },
      },
    },
  });

  if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');
  return school;
}

// ─── Public facilities ────────────────────────────────────────

export async function getPublicFacilities(schoolId: string) {
  return prisma.schoolFacility.findMany({
    where: { schoolId },
    select: { id: true, name: true, description: true, icon: true },
    orderBy: { name: 'asc' },
  });
}

// ─── Public achievements ─────────────────────────────────────

export async function getPublicAchievements(schoolId: string) {
  return prisma.schoolAchievement.findMany({
    where: { schoolId },
    select: { id: true, title: true, description: true, year: true },
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
  });
}

// ─── Public gallery ──────────────────────────────────────────

export async function getPublicGallery(schoolId: string, category?: string) {
  const where: any = { schoolId, isPublic: true };
  if (category) where.category = category;

  return prisma.galleryItem.findMany({
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
    take: 50, // Limit gallery for public page
  });
}

// ─── Public announcements ────────────────────────────────────

export async function getPublicNotices(schoolId: string) {
  return prisma.notice.findMany({
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
}

// ─── Public events ────────────────────────────────────────────

export async function getPublicEvents(schoolId: string) {
  return prisma.schoolEvent.findMany({
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
