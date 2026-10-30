"use strict";
// ============================================================
// Public Website Service
// Fetches ONLY publicly-safe data — no auth required.
// School isolation enforced by slug → schoolId resolution.
// Private ERP data is NEVER returned from these functions.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicHomePageData = exports.getPublicEvents = exports.getPublicNotices = exports.getPublicGallery = exports.getPublicAchievements = exports.getPublicFacilities = exports.getPublicSchoolProfile = exports.listPublicSchools = exports.resolvePublicSchool = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
// Resolve school by slug — returns schoolId or throws
async function resolvePublicSchool(slug) {
    const school = await prisma_1.prisma.school.findUnique({
        where: { slug },
        select: { id: true, isActive: true, isPublicEnabled: true },
    });
    if (!school || !school.isActive) {
        throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
    }
    if (!school.isPublicEnabled) {
        throw new errorHandler_1.AppError('School website is not publicly available', 403, 'FORBIDDEN');
    }
    return school.id;
}
exports.resolvePublicSchool = resolvePublicSchool;
// ─── Public school list (directory) ─────────────────────────
async function listPublicSchools() {
    return prisma_1.prisma.school.findMany({
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
exports.listPublicSchools = listPublicSchools;
// ─── Public school profile ────────────────────────────────────
async function getPublicSchoolProfile(schoolId) {
    const school = await prisma_1.prisma.school.findUnique({
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
    if (!school)
        throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
    return school;
}
exports.getPublicSchoolProfile = getPublicSchoolProfile;
// ─── Public facilities ────────────────────────────────────────
async function getPublicFacilities(schoolId) {
    return prisma_1.prisma.schoolFacility.findMany({
        where: { schoolId },
        select: { id: true, name: true, description: true, icon: true },
        orderBy: { name: 'asc' },
    });
}
exports.getPublicFacilities = getPublicFacilities;
// ─── Public achievements ─────────────────────────────────────
async function getPublicAchievements(schoolId) {
    return prisma_1.prisma.schoolAchievement.findMany({
        where: { schoolId },
        select: { id: true, title: true, description: true, year: true },
        orderBy: [{ year: 'desc' }, { title: 'asc' }],
    });
}
exports.getPublicAchievements = getPublicAchievements;
// ─── Public gallery ──────────────────────────────────────────
async function getPublicGallery(schoolId, category) {
    const where = { schoolId, isPublic: true };
    if (category)
        where.category = category;
    return prisma_1.prisma.galleryItem.findMany({
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
exports.getPublicGallery = getPublicGallery;
// ─── Public announcements ────────────────────────────────────
async function getPublicNotices(schoolId) {
    return prisma_1.prisma.notice.findMany({
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
exports.getPublicNotices = getPublicNotices;
// ─── Public events ────────────────────────────────────────────
async function getPublicEvents(schoolId) {
    return prisma_1.prisma.schoolEvent.findMany({
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
exports.getPublicEvents = getPublicEvents;
// ─── Full public home page data (single combined call) ───────
async function getPublicHomePageData(schoolId) {
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
exports.getPublicHomePageData = getPublicHomePageData;
//# sourceMappingURL=public.service.js.map