"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchool = exports.createSchool = exports.getSchoolById = exports.getAllSchools = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const logger_1 = require("../../lib/logger");
// ─── Slug generation ─────────────────────────────────────────
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // spaces → dashes
        .replace(/-+/g, '-') // collapse dashes
        .substring(0, 60); // max length
}
async function generateUniqueSlug(name) {
    const base = generateSlug(name);
    let slug = base;
    let counter = 1;
    while (true) {
        const existing = await prisma_1.prisma.school.findUnique({ where: { slug } });
        if (!existing)
            return slug;
        slug = `${base}-${counter}`;
        counter++;
    }
}
async function getAllSchools(req, res, next) {
    try {
        const { page = '1', limit = '10', search = '' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const where = search
            ? { name: { contains: search, mode: 'insensitive' } }
            : {};
        const [schools, total] = await Promise.all([
            prisma_1.prisma.school.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { students: true, teachers: true }
                    }
                }
            }),
            prisma_1.prisma.school.count({ where }),
        ]);
        res.json({
            success: true,
            data: schools,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getAllSchools = getAllSchools;
async function getSchoolById(req, res, next) {
    try {
        const id = req.params.id;
        const school = await prisma_1.prisma.school.findUnique({
            where: { id },
            include: {
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
exports.getSchoolById = getSchoolById;
async function createSchool(req, res, next) {
    try {
        const data = req.body;
        // Auto-generate a unique slug from the school name
        const slug = await generateUniqueSlug(data.name);
        const school = await prisma_1.prisma.school.create({
            data: {
                ...data,
                slug,
                contactEmail: data.contactEmail || null,
                logoUrl: data.logoUrl || null,
            },
        });
        logger_1.logger.info(`School created: ${school.id} (slug: ${slug})`, { userId: req.user?.id });
        // Audit log — school onboarding is critical
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'SCHOOL_CREATED',
                entityType: 'School',
                entityId: school.id,
                details: { name: school.name, slug },
            }
        });
        res.status(201).json({ success: true, data: school });
    }
    catch (error) {
        next(error);
    }
}
exports.createSchool = createSchool;
async function updateSchool(req, res, next) {
    try {
        const id = req.params.id;
        const data = req.body;
        const existing = await prisma_1.prisma.school.findUnique({ where: { id } });
        if (!existing) {
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        }
        const school = await prisma_1.prisma.school.update({
            where: { id },
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
exports.updateSchool = updateSchool;
//# sourceMappingURL=schools.controller.js.map