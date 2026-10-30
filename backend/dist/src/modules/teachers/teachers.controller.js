"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacher = exports.createTeacher = exports.getTeacherById = exports.getTeachers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const dataDb_1 = require("../../lib/dataDb");
async function getTeachers(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const { teachers, total } = await (0, dataDb_1.dbGetTeachers)({
            schoolId,
            skip,
            take: limit,
        });
        res.json({
            success: true,
            data: teachers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getTeachers = getTeachers;
async function getTeacherById(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const teacherId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const teacher = await prisma_1.prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                user: { select: { email: true, isActive: true } },
                teacherClassSubjects: {
                    include: {
                        class: true,
                        subject: true
                    }
                }
            }
        });
        if (!teacher || teacher.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Teacher not found', 404, 'NOT_FOUND');
        }
        res.json({ success: true, data: teacher });
    }
    catch (error) {
        next(error);
    }
}
exports.getTeacherById = getTeacherById;
async function createTeacher(req, res, next) {
    try {
        // SECURITY: schoolId ALWAYS comes from authenticated user — never trusted from client body
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const school = await (0, dataDb_1.dbGetSchoolById)(schoolId);
        if (!school)
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        const schoolSlug = school.slug ? school.slug.replace(/-/g, '').toLowerCase() : 'school';
        let emailToUse = data.email?.trim() || '';
        if (!emailToUse) {
            const cleanFirstName = data.firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const cleanLastName = data.lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const baseEmail = `teacher.${cleanFirstName}.${cleanLastName}`;
            let suffix = 1;
            let isUnique = false;
            while (!isUnique) {
                const suffixStr = suffix === 1 ? '' : String(suffix);
                emailToUse = `${baseEmail}${suffixStr}@${schoolSlug}.eduvanta.teacher`;
                const exists = await (0, dataDb_1.dbFindUserByEmail)(emailToUse);
                if (!exists) {
                    isUnique = true;
                }
                else {
                    suffix++;
                }
            }
        }
        else {
            const existingUser = await (0, dataDb_1.dbFindUserByEmail)(emailToUse);
            if (existingUser) {
                throw new errorHandler_1.AppError('This email is already associated with another account', 400, 'DUPLICATE_EMAIL');
            }
        }
        // Default password: Teacher@123 — principal should communicate this to the teacher
        const passwordHash = await bcryptjs_1.default.hash('Teacher@123', 10);
        const user = await (0, dataDb_1.dbCreateUser)({
            email: emailToUse,
            name: `${data.firstName} ${data.lastName}`.trim(),
            passwordHash,
            role: 'TEACHER',
            schoolId,
        });
        const teacher = await (0, dataDb_1.dbCreateTeacher)({
            schoolId,
            userId: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            employeeId: data.employeeId || null,
            qualification: data.qualification || null,
        });
        res.status(201).json({ success: true, data: teacher });
    }
    catch (error) {
        next(error);
    }
}
exports.createTeacher = createTeacher;
async function updateTeacher(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const teacherId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const existingTeacher = await prisma_1.prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { user: true }
        });
        if (!existingTeacher || existingTeacher.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Teacher not found', 404, 'NOT_FOUND');
        }
        const teacher = await prisma_1.prisma.$transaction(async (tx) => {
            // If active status changed, sync it with the User table
            if (data.isActive !== undefined && data.isActive !== existingTeacher.isActive) {
                await tx.user.update({
                    where: { id: existingTeacher.userId },
                    data: { isActive: data.isActive }
                });
            }
            return tx.teacher.update({
                where: { id: teacherId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    employeeId: data.employeeId || null,
                    qualification: data.qualification || null,
                    isActive: data.isActive,
                },
                include: {
                    user: { select: { email: true, isActive: true } }
                }
            });
        });
        res.json({ success: true, data: teacher });
    }
    catch (error) {
        next(error);
    }
}
exports.updateTeacher = updateTeacher;
//# sourceMappingURL=teachers.controller.js.map