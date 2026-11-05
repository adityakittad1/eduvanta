"use strict";
/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvents = exports.deleteAchievement = exports.createAchievement = exports.getAchievements = exports.deleteFacility = exports.createFacility = exports.getFacilities = exports.updateSchoolProfile = exports.getSchoolProfile = void 0;
const prisma_1 = require("../../lib/prisma");
const supabase_1 = require("../../lib/supabase");
const authDb_1 = require("../../lib/authDb");
const dataDb_1 = require("../../lib/dataDb");
const errorHandler_1 = require("../../middleware/errorHandler");
// ─── School Profile ───────────────────────────────────────────
async function getSchoolProfile(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        // 1. Try Prisma first if healthy
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const profile = await prisma_1.prisma.school.findUnique({
                    where: { id: schoolId },
                    include: {
                        facilities: true,
                        achievements: true,
                        events: {
                            orderBy: { eventDate: 'asc' },
                            take: 20,
                        },
                        _count: {
                            select: {
                                students: { where: { isActive: true } },
                                teachers: { where: { isActive: true } },
                                classes: { where: { isActive: true } },
                            },
                        },
                    },
                });
                if (profile) {
                    res.json({ success: true, data: profile });
                    return;
                }
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        // 2. Serverless Supabase Fallback
        if (supabase_1.supabase) {
            const { data: school } = await supabase_1.supabase
                .from('schools')
                .select('*')
                .eq('id', schoolId)
                .maybeSingle();
            if (!school)
                throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
            const [{ data: facilities }, { data: achievements }, { data: events }, { count: studentCount }, { count: teacherCount }, { count: classCount },] = await Promise.all([
                supabase_1.supabase.from('school_facilities').select('*').eq('school_id', schoolId).order('name', { ascending: true }),
                supabase_1.supabase.from('school_achievements').select('*').eq('school_id', schoolId).order('year', { ascending: false }),
                supabase_1.supabase.from('school_events').select('*').eq('school_id', schoolId).order('event_date', { ascending: true }).limit(20),
                supabase_1.supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
                supabase_1.supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
                supabase_1.supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
            ]);
            const mappedSchool = {
                id: school.id,
                name: school.name,
                slug: school.slug,
                logoUrl: school.logo_url,
                address: school.address,
                contactPhone: school.contact_phone,
                contactEmail: school.contact_email,
                principalName: school.principal_name,
                description: school.description,
                tagline: school.tagline,
                establishedYear: school.established_year,
                isActive: school.is_active ?? true,
                isPublicEnabled: school.is_public_enabled ?? true,
                facilities: (facilities || []).map((f) => ({
                    id: f.id,
                    name: f.name,
                    description: f.description,
                    icon: f.icon,
                })),
                achievements: (achievements || []).map((a) => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    year: a.year,
                })),
                events: (events || []).map((e) => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    eventDate: e.event_date,
                    isPublic: e.is_public,
                })),
                _count: {
                    students: studentCount || 0,
                    teachers: teacherCount || 0,
                    classes: classCount || 0,
                },
            };
            res.json({ success: true, data: mappedSchool });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.getSchoolProfile = getSchoolProfile;
async function updateSchoolProfile(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { name, description, tagline, address, contactPhone, contactEmail, principalName, logoUrl, establishedYear, isPublicEnabled, } = req.body;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const updated = await prisma_1.prisma.school.update({
                    where: { id: schoolId },
                    data: {
                        ...(name !== undefined && { name }),
                        ...(description !== undefined && { description }),
                        ...(tagline !== undefined && { tagline }),
                        ...(address !== undefined && { address }),
                        ...(contactPhone !== undefined && { contactPhone }),
                        ...(contactEmail !== undefined && { contactEmail }),
                        ...(principalName !== undefined && { principalName }),
                        ...(logoUrl !== undefined && { logoUrl }),
                        ...(establishedYear !== undefined && { establishedYear: establishedYear ? Number(establishedYear) : null }),
                        ...(isPublicEnabled !== undefined && { isPublicEnabled: Boolean(isPublicEnabled) }),
                    },
                });
                res.json({ success: true, data: updated });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const payload = { updated_at: new Date().toISOString() };
            if (name !== undefined)
                payload.name = name;
            if (description !== undefined)
                payload.description = description;
            if (tagline !== undefined)
                payload.tagline = tagline;
            if (address !== undefined)
                payload.address = address;
            if (contactPhone !== undefined)
                payload.contact_phone = contactPhone;
            if (contactEmail !== undefined)
                payload.contact_email = contactEmail;
            if (principalName !== undefined)
                payload.principal_name = principalName;
            if (logoUrl !== undefined)
                payload.logo_url = logoUrl;
            if (establishedYear !== undefined)
                payload.established_year = establishedYear ? Number(establishedYear) : null;
            if (isPublicEnabled !== undefined)
                payload.is_public_enabled = Boolean(isPublicEnabled);
            const { data, error } = await supabase_1.supabase
                .from('schools')
                .update(payload)
                .eq('id', schoolId)
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({
                success: true,
                data: {
                    id: data.id,
                    name: data.name,
                    slug: data.slug,
                    logoUrl: data.logo_url,
                    address: data.address,
                    contactPhone: data.contact_phone,
                    contactEmail: data.contact_email,
                    principalName: data.principal_name,
                    description: data.description,
                    tagline: data.tagline,
                    establishedYear: data.established_year,
                    isPublicEnabled: data.is_public_enabled,
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.updateSchoolProfile = updateSchoolProfile;
// ─── Facilities ───────────────────────────────────────────────
async function getFacilities(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const facilities = await prisma_1.prisma.schoolFacility.findMany({
                    where: { schoolId },
                    orderBy: { name: 'asc' },
                });
                res.json({ success: true, data: facilities });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { data, error } = await supabase_1.supabase
                .from('school_facilities')
                .select('*')
                .eq('school_id', schoolId)
                .order('name', { ascending: true });
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({
                success: true,
                data: (data || []).map((f) => ({
                    id: f.id,
                    name: f.name,
                    description: f.description,
                    icon: f.icon,
                }))
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.getFacilities = getFacilities;
async function createFacility(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { name, description, icon } = req.body;
        if (!name?.trim())
            throw new errorHandler_1.AppError('Facility name is required', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const facility = await prisma_1.prisma.schoolFacility.create({
                    data: { schoolId, name: name.trim(), description: description || null, icon: icon || null },
                });
                res.status(201).json({ success: true, data: facility });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const facilityId = (0, dataDb_1.generateCuid)();
            const { data, error } = await supabase_1.supabase
                .from('school_facilities')
                .insert({
                id: facilityId,
                school_id: schoolId,
                name: name.trim(),
                description: description || null,
                icon: icon || null,
            })
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.status(201).json({
                success: true,
                data: {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    icon: data.icon,
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.createFacility = createFacility;
async function deleteFacility(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const id = req.params.id;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const facility = await prisma_1.prisma.schoolFacility.findUnique({ where: { id } });
                if (!facility || facility.schoolId !== schoolId)
                    throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
                await prisma_1.prisma.schoolFacility.delete({ where: { id } });
                res.json({ success: true, data: { id } });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { error } = await supabase_1.supabase
                .from('school_facilities')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({ success: true, data: { id } });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.deleteFacility = deleteFacility;
// ─── Achievements ─────────────────────────────────────────────
async function getAchievements(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const achievements = await prisma_1.prisma.schoolAchievement.findMany({
                    where: { schoolId },
                    orderBy: [{ year: 'desc' }, { title: 'asc' }],
                });
                res.json({ success: true, data: achievements });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { data, error } = await supabase_1.supabase
                .from('school_achievements')
                .select('*')
                .eq('school_id', schoolId)
                .order('year', { ascending: false });
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({
                success: true,
                data: (data || []).map((a) => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    year: a.year,
                }))
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.getAchievements = getAchievements;
async function createAchievement(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { title, description, year } = req.body;
        if (!title?.trim())
            throw new errorHandler_1.AppError('Achievement title is required', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const achievement = await prisma_1.prisma.schoolAchievement.create({
                    data: {
                        schoolId,
                        title: title.trim(),
                        description: description || null,
                        year: year ? Number(year) : null,
                    },
                });
                res.status(201).json({ success: true, data: achievement });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const achievementId = (0, dataDb_1.generateCuid)();
            const { data, error } = await supabase_1.supabase
                .from('school_achievements')
                .insert({
                id: achievementId,
                school_id: schoolId,
                title: title.trim(),
                description: description || null,
                year: year ? Number(year) : null,
            })
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.status(201).json({
                success: true,
                data: {
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    year: data.year,
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.createAchievement = createAchievement;
async function deleteAchievement(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const id = req.params.id;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const achievement = await prisma_1.prisma.schoolAchievement.findUnique({ where: { id } });
                if (!achievement || achievement.schoolId !== schoolId)
                    throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
                await prisma_1.prisma.schoolAchievement.delete({ where: { id } });
                res.json({ success: true, data: { id } });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { error } = await supabase_1.supabase
                .from('school_achievements')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({ success: true, data: { id } });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAchievement = deleteAchievement;
// ─── Events ───────────────────────────────────────────────────
async function getEvents(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const events = await prisma_1.prisma.schoolEvent.findMany({
                    where: { schoolId },
                    orderBy: { eventDate: 'asc' },
                });
                res.json({ success: true, data: events });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { data, error } = await supabase_1.supabase
                .from('school_events')
                .select('*')
                .eq('school_id', schoolId)
                .order('event_date', { ascending: true });
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({
                success: true,
                data: (data || []).map((e) => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    eventDate: e.event_date,
                    isPublic: e.is_public,
                }))
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.getEvents = getEvents;
async function createEvent(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { title, description, eventDate, isPublic } = req.body;
        if (!title?.trim())
            throw new errorHandler_1.AppError('Event title is required', 400, 'BAD_REQUEST');
        if (!eventDate)
            throw new errorHandler_1.AppError('Event date is required', 400, 'BAD_REQUEST');
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const event = await prisma_1.prisma.schoolEvent.create({
                    data: {
                        schoolId,
                        title: title.trim(),
                        description: description || null,
                        eventDate: new Date(eventDate),
                        isPublic: isPublic !== false,
                    },
                });
                res.status(201).json({ success: true, data: event });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const eventId = (0, dataDb_1.generateCuid)();
            const { data, error } = await supabase_1.supabase
                .from('school_events')
                .insert({
                id: eventId,
                school_id: schoolId,
                title: title.trim(),
                description: description || null,
                event_date: new Date(eventDate).toISOString(),
                is_public: isPublic !== false,
            })
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.status(201).json({
                success: true,
                data: {
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    eventDate: data.event_date,
                    isPublic: data.is_public,
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.createEvent = createEvent;
async function updateEvent(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const id = req.params.id;
        const { title, description, eventDate, isPublic } = req.body;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const existing = await prisma_1.prisma.schoolEvent.findUnique({ where: { id } });
                if (!existing || existing.schoolId !== schoolId)
                    throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
                const updated = await prisma_1.prisma.schoolEvent.update({
                    where: { id },
                    data: {
                        ...(title !== undefined && { title: title.trim() }),
                        ...(description !== undefined && { description }),
                        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
                        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
                    },
                });
                res.json({ success: true, data: updated });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const updatePayload = {};
            if (title !== undefined)
                updatePayload.title = title.trim();
            if (description !== undefined)
                updatePayload.description = description;
            if (eventDate !== undefined)
                updatePayload.event_date = new Date(eventDate).toISOString();
            if (isPublic !== undefined)
                updatePayload.is_public = Boolean(isPublic);
            const { data, error } = await supabase_1.supabase
                .from('school_events')
                .update(updatePayload)
                .eq('id', id)
                .eq('school_id', schoolId)
                .select()
                .single();
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({
                success: true,
                data: {
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    eventDate: data.event_date,
                    isPublic: data.is_public,
                }
            });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.updateEvent = updateEvent;
async function deleteEvent(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const id = req.params.id;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                const event = await prisma_1.prisma.schoolEvent.findUnique({ where: { id } });
                if (!event || event.schoolId !== schoolId)
                    throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
                await prisma_1.prisma.schoolEvent.delete({ where: { id } });
                res.json({ success: true, data: { id } });
                return;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        if (supabase_1.supabase) {
            const { error } = await supabase_1.supabase
                .from('school_events')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);
            if (error)
                throw new errorHandler_1.AppError(error.message, 500, 'INTERNAL_ERROR');
            res.json({ success: true, data: { id } });
            return;
        }
        throw new errorHandler_1.AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    catch (error) {
        next(error);
    }
}
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=school-profile.controller.js.map