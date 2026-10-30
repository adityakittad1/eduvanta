"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAchievement = exports.addAchievement = exports.removeFacility = exports.addFacility = exports.updateMySchoolProfile = exports.getMySchoolProfile = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getMySchoolProfile(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId) {
            throw new errorHandler_1.AppError('No school associated with this user', 400, 'BAD_REQUEST');
        }
        const school = await prisma_1.prisma.school.findUnique({
            where: { id: schoolId },
            include: {
                facilities: true,
                achievements: {
                    orderBy: { year: 'desc' }
                },
                _count: {
                    select: { students: true, teachers: true }
                }
            }
        });
        if (!school) {
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        }
        res.json({ success: true, data: school });
    }
    catch (error) {
        next(error);
    }
}
exports.getMySchoolProfile = getMySchoolProfile;
async function updateMySchoolProfile(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId) {
            throw new errorHandler_1.AppError('No school associated with this user', 400, 'BAD_REQUEST');
        }
        const data = req.body;
        const school = await prisma_1.prisma.school.update({
            where: { id: schoolId },
            data: {
                ...data,
                contactEmail: data.contactEmail === '' ? null : data.contactEmail,
                logoUrl: data.logoUrl === '' ? null : data.logoUrl,
            },
        });
        res.json({ success: true, data: school });
    }
    catch (error) {
        next(error);
    }
}
exports.updateMySchoolProfile = updateMySchoolProfile;
async function addFacility(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school associated', 400, 'BAD_REQUEST');
        const data = req.body;
        const facility = await prisma_1.prisma.schoolFacility.create({
            data: {
                schoolId,
                name: data.name,
                description: data.description || null,
            }
        });
        res.status(201).json({ success: true, data: facility });
    }
    catch (error) {
        next(error);
    }
}
exports.addFacility = addFacility;
async function removeFacility(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const facilityId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school associated', 400, 'BAD_REQUEST');
        // Ensure facility belongs to school
        const facility = await prisma_1.prisma.schoolFacility.findUnique({ where: { id: facilityId } });
        if (!facility || facility.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Facility not found or not owned by this school', 404, 'NOT_FOUND');
        }
        await prisma_1.prisma.schoolFacility.delete({ where: { id: facilityId } });
        res.json({ success: true, message: 'Facility removed' });
    }
    catch (error) {
        next(error);
    }
}
exports.removeFacility = removeFacility;
async function addAchievement(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school associated', 400, 'BAD_REQUEST');
        const data = req.body;
        const achievement = await prisma_1.prisma.schoolAchievement.create({
            data: {
                schoolId,
                title: data.title,
                description: data.description || null,
                year: data.year || null,
            }
        });
        res.status(201).json({ success: true, data: achievement });
    }
    catch (error) {
        next(error);
    }
}
exports.addAchievement = addAchievement;
async function removeAchievement(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const achievementId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school associated', 400, 'BAD_REQUEST');
        const achievement = await prisma_1.prisma.schoolAchievement.findUnique({ where: { id: achievementId } });
        if (!achievement || achievement.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Achievement not found or not owned by this school', 404, 'NOT_FOUND');
        }
        await prisma_1.prisma.schoolAchievement.delete({ where: { id: achievementId } });
        res.json({ success: true, message: 'Achievement removed' });
    }
    catch (error) {
        next(error);
    }
}
exports.removeAchievement = removeAchievement;
//# sourceMappingURL=profile.controller.js.map