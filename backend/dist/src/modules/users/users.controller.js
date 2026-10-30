"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = exports.getAllUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const logger_1 = require("../../lib/logger");
async function getAllUsers(req, res, next) {
    try {
        const { page = '1', limit = '10', search = '', role } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        // Tenancy Check
        if (req.user?.role !== 'SUPER_ADMIN') {
            where.schoolId = req.tenant.id;
            where.role = { in: ['TEACHER', 'STUDENT'] }; // Principals can only see teachers and students
        }
        if (search) {
            where.email = { contains: search, mode: 'insensitive' };
        }
        if (role) {
            // If a non-SUPER_ADMIN tries to filter by SUPER_ADMIN or PRINCIPAL, ignore or restrict
            if (req.user?.role !== 'SUPER_ADMIN' && ['SUPER_ADMIN', 'PRINCIPAL'].includes(role)) {
                where.role = 'TEACHER'; // Fallback to safe
            }
            else {
                where.role = role;
            }
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    schoolId: true,
                    isActive: true,
                    createdAt: true,
                    school: {
                        select: { name: true }
                    }
                }
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        res.json({
            success: true,
            data: users,
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
exports.getAllUsers = getAllUsers;
async function createUser(req, res, next) {
    try {
        const data = req.body;
        // Tenancy & Authorization Checks
        if (req.user?.role !== 'SUPER_ADMIN') {
            // Principal constraints: can only create TEACHER/STUDENT for their own school
            if (data.role === 'SUPER_ADMIN' || data.role === 'PRINCIPAL') {
                throw new errorHandler_1.AppError('You do not have permission to create this role', 403, 'FORBIDDEN');
            }
            if (data.schoolId !== req.tenant.id) {
                throw new errorHandler_1.AppError('You can only create users for your own school', 403, 'FORBIDDEN');
            }
        }
        else {
            // SUPER_ADMIN creating PRINCIPAL: schoolId is mandatory
            if (data.role === 'PRINCIPAL' && !data.schoolId) {
                throw new errorHandler_1.AppError('A Principal must be assigned to a school', 400, 'BAD_REQUEST');
            }
        }
        let emailToUse = data.email || '';
        if (!emailToUse && data.schoolId) {
            const school = await prisma_1.prisma.school.findUnique({ where: { id: data.schoolId } });
            if (school) {
                const schoolSlug = school.slug ? school.slug.replace(/-/g, '').toLowerCase() : 'school';
                if (data.role === 'PRINCIPAL') {
                    emailToUse = `principal.${schoolSlug}@eduvanta.local`;
                }
                else if (data.role === 'TEACHER') {
                    emailToUse = `teacher.${data.name.replace(/\s+/g, '.').toLowerCase()}.${schoolSlug}@eduvanta.local`;
                }
                else {
                    emailToUse = `${data.role.toLowerCase()}.${data.name.replace(/\s+/g, '.').toLowerCase()}.${schoolSlug}@eduvanta.local`;
                }
            }
        }
        else if (!emailToUse) {
            throw new errorHandler_1.AppError('Email is required if school is not provided', 400, 'BAD_REQUEST');
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: emailToUse }
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('A user with this email already exists. Please use a different email or manage the existing account.', 400, 'DUPLICATE_EMAIL');
        }
        const passwordToUse = data.password || 'Eduvanta@123';
        const passwordHash = await bcryptjs_1.default.hash(passwordToUse, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: emailToUse,
                name: data.name || null,
                passwordHash,
                role: data.role,
                schoolId: data.schoolId || null,
                isActive: data.isActive ?? true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                isActive: true,
                createdAt: true,
                school: { select: { name: true } },
            }
        });
        logger_1.logger.info(`User created: ${user.id} (${user.role}) name=${user.name}`, { createdBy: req.user?.id });
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
}
exports.createUser = createUser;
async function updateUser(req, res, next) {
    try {
        const id = req.params.id;
        const data = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new errorHandler_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        // Tenancy Check
        if (req.user?.role !== 'SUPER_ADMIN') {
            if (existing.schoolId !== req.tenant.id) {
                throw new errorHandler_1.AppError('You do not have permission to update this user', 403, 'FORBIDDEN');
            }
            if (existing.role === 'SUPER_ADMIN' || existing.role === 'PRINCIPAL') {
                throw new errorHandler_1.AppError('You do not have permission to update this role', 403, 'FORBIDDEN');
            }
            if (data.role && (data.role === 'SUPER_ADMIN' || data.role === 'PRINCIPAL')) {
                throw new errorHandler_1.AppError('You cannot elevate roles to Admin or Principal', 403, 'FORBIDDEN');
            }
            if (data.schoolId && data.schoolId !== req.tenant.id) {
                throw new errorHandler_1.AppError('You cannot move users to another school', 403, 'FORBIDDEN');
            }
        }
        const updateData = { ...data };
        if (data.password) {
            updateData.passwordHash = await bcryptjs_1.default.hash(data.password, 10);
            delete updateData.password;
        }
        if (data.email && data.email !== existing.email) {
            const emailTaken = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
            if (emailTaken) {
                throw new errorHandler_1.AppError('Email is already in use', 400, 'BAD_REQUEST');
            }
        }
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true,
                schoolId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
}
exports.updateUser = updateUser;
//# sourceMappingURL=users.controller.js.map