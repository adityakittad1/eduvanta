"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvents = exports.deleteAchievement = exports.createAchievement = exports.getAchievements = exports.deleteFacility = exports.createFacility = exports.getFacilities = exports.updateSchoolProfile = exports.getSchoolProfile = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
// ─── School Profile ───────────────────────────────────────────
async function getSchoolProfile(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
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
        if (!profile)
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        res.json({ success: true, data: profile });
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
        const facilities = await prisma_1.prisma.schoolFacility.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: facilities });
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
        const facility = await prisma_1.prisma.schoolFacility.create({
            data: { schoolId, name: name.trim(), description: description || null, icon: icon || null },
        });
        res.status(201).json({ success: true, data: facility });
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
        const facility = await prisma_1.prisma.schoolFacility.findUnique({ where: { id } });
        if (!facility || facility.schoolId !== schoolId)
            throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
        await prisma_1.prisma.schoolFacility.delete({ where: { id } });
        res.json({ success: true, data: { id } });
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
        const achievements = await prisma_1.prisma.schoolAchievement.findMany({
            where: { schoolId },
            orderBy: [{ year: 'desc' }, { title: 'asc' }],
        });
        res.json({ success: true, data: achievements });
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
        const achievement = await prisma_1.prisma.schoolAchievement.create({
            data: {
                schoolId,
                title: title.trim(),
                description: description || null,
                year: year ? Number(year) : null,
            },
        });
        res.status(201).json({ success: true, data: achievement });
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
        const achievement = await prisma_1.prisma.schoolAchievement.findUnique({ where: { id } });
        if (!achievement || achievement.schoolId !== schoolId)
            throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
        await prisma_1.prisma.schoolAchievement.delete({ where: { id } });
        res.json({ success: true, data: { id } });
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
        const events = await prisma_1.prisma.schoolEvent.findMany({
            where: { schoolId },
            orderBy: { eventDate: 'asc' },
        });
        res.json({ success: true, data: events });
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
        const existing = await prisma_1.prisma.schoolEvent.findUnique({ where: { id } });
        if (!existing || existing.schoolId !== schoolId)
            throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
        const { title, description, eventDate, isPublic } = req.body;
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
        const event = await prisma_1.prisma.schoolEvent.findUnique({ where: { id } });
        if (!event || event.schoolId !== schoolId)
            throw new errorHandler_1.AppError('Not found', 404, 'NOT_FOUND');
        await prisma_1.prisma.schoolEvent.delete({ where: { id } });
        res.json({ success: true, data: { id } });
    }
    catch (error) {
        next(error);
    }
}
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=school-profile.controller.js.map