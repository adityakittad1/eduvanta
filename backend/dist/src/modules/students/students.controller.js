"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getStudents = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getStudents(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const classId = req.query.classId;
        const where = {
            schoolId,
            ...(classId === 'null' ? { classId: null } : classId ? { classId } : {}),
        };
        const [students, total] = await Promise.all([
            prisma_1.prisma.student.findMany({
                where,
                include: {
                    class: true,
                    user: { select: { email: true, isActive: true } }
                },
                skip,
                take: limit,
                orderBy: { firstName: 'asc' },
            }),
            prisma_1.prisma.student.count({ where }),
        ]);
        res.json({
            success: true,
            data: students,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getStudents = getStudents;
async function getStudentById(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const studentId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const student = await prisma_1.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                class: true,
                user: { select: { email: true, isActive: true } },
                earlyWarningFlags: {
                    where: { isResolved: false }
                },
                // In future phases: attendanceRecords, academicRecords, quizAttempts will be joined or fetched via specialized routes
            }
        });
        if (!student || student.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Student not found', 404, 'NOT_FOUND');
        }
        res.json({ success: true, data: student });
    }
    catch (error) {
        next(error);
    }
}
exports.getStudentById = getStudentById;
async function createStudent(req, res, next) {
    try {
        // SECURITY: schoolId ALWAYS comes from authenticated user — never trusted from client body
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        // Check if admission number already exists in this school
        const existingStudent = await prisma_1.prisma.student.findUnique({
            where: { schoolId_admissionNumber: { schoolId, admissionNumber: data.admissionNumber } }
        });
        if (existingStudent) {
            throw new errorHandler_1.AppError('Admission number already in use at this school', 400, 'BAD_REQUEST');
        }
        const school = await prisma_1.prisma.school.findUnique({ where: { id: schoolId } });
        if (!school)
            throw new errorHandler_1.AppError('School not found', 404, 'NOT_FOUND');
        const schoolSlug = school.slug ? school.slug.replace(/-/g, '').toLowerCase() : 'school';
        // Auto-provision user account if email is provided, else generate one
        let emailToUse = data.email?.trim() || '';
        if (!emailToUse) {
            const cleanFirstName = data.firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const cleanLastName = data.lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const baseEmail = `${cleanFirstName}.${cleanLastName}.${schoolSlug}`;
            let suffix = 1;
            let isUnique = false;
            while (!isUnique) {
                const suffixStr = String(suffix).padStart(3, '0');
                emailToUse = `${baseEmail}${suffixStr}@eduvanta.student`;
                const exists = await prisma_1.prisma.user.findUnique({ where: { email: emailToUse } });
                if (!exists) {
                    isUnique = true;
                }
                else {
                    suffix++;
                }
            }
        }
        else {
            const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: emailToUse } });
            if (existingUser) {
                throw new errorHandler_1.AppError('This email is already associated with another account', 400, 'DUPLICATE_EMAIL');
            }
        }
        // Default password: Student@123 — must be changed on first login (future enforcement)
        const passwordHash = await bcryptjs_1.default.hash('Student@123', 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: emailToUse,
                name: `${data.firstName} ${data.lastName}`.trim(), // Store display name
                passwordHash,
                role: 'STUDENT',
                schoolId, // ALWAYS the authenticated school — never from client
            }
        });
        const student = await prisma_1.prisma.student.create({
            data: {
                schoolId, // ALWAYS from authenticated context
                userId: user.id,
                admissionNumber: data.admissionNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                gender: data.gender,
                address: data.address || null,
                guardianName: data.guardianName || null,
                guardianPhone: data.guardianPhone || null,
                academicYear: data.academicYear,
                classId: data.classId || null,
            },
            include: {
                user: { select: { email: true } },
                class: true
            }
        });
        res.status(201).json({ success: true, data: student });
    }
    catch (error) {
        next(error);
    }
}
exports.createStudent = createStudent;
async function updateStudent(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const studentId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const existingStudent = await prisma_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!existingStudent || existingStudent.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Student not found', 404, 'NOT_FOUND');
        }
        const student = await prisma_1.prisma.student.update({
            where: { id: studentId },
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                classId: data.classId === '' ? null : data.classId,
            },
            include: {
                user: { select: { email: true } },
                class: true
            }
        });
        res.json({ success: true, data: student });
    }
    catch (error) {
        next(error);
    }
}
exports.updateStudent = updateStudent;
//# sourceMappingURL=students.controller.js.map