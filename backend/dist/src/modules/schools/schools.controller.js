"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchool = exports.createSchool = exports.getSchoolById = exports.getAllSchools = void 0;
const errorHandler_1 = require("../../middleware/errorHandler");
const logger_1 = require("../../lib/logger");
const dataDb_1 = require("../../lib/dataDb");
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
        const existing = await (0, dataDb_1.dbFindSchoolBySlug)(slug);
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
        const { schools, total } = await (0, dataDb_1.dbGetAllSchools)({
            skip,
            take: limitNum,
            search: search || undefined,
        });
        res.json({
            success: true,
            data: schools,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1,
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
        const school = await (0, dataDb_1.dbGetSchoolById)(id);
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
        const school = await (0, dataDb_1.dbCreateSchool)({
            name: data.name,
            slug,
            address: data.address || null,
            contactPhone: data.contactPhone || null,
            contactEmail: data.contactEmail || null,
            principalName: data.principalName || null,
            description: data.description || null,
            logoUrl: data.logoUrl || null,
        });
        logger_1.logger.info(`School created: ${school.id} (slug: ${slug})`, { userId: req.user?.id });
        // Audit log — school onboarding is critical
        await (0, dataDb_1.dbCreateAuditLog)({
            userId: req.user.id,
            action: 'SCHOOL_CREATED',
            entityType: 'School',
            entityId: school.id,
            details: { name: school.name, slug },
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
        const existing = await (0, dataDb_1.dbGetSchoolById)(id);
        if (!existing) {
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        }
        const school = await (0, dataDb_1.dbUpdateSchool)(id, data);
        res.json({ success: true, data: school });
    }
    catch (error) {
        next(error);
    }
}
exports.updateSchool = updateSchool;
//# sourceMappingURL=schools.controller.js.map