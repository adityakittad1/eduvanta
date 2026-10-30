"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getStudents = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../../middleware/errorHandler");
const dataDb_1 = require("../../lib/dataDb");
async function getStudents(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const classId = req.query.classId;
        const { students, total } = await (0, dataDb_1.dbGetStudents)({
            schoolId,
            classId,
            skip,
            take: limit,
        });
        res.json({
            success: true,
            data: students,
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
exports.getStudents = getStudents;
async function getStudentById(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const studentId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const student = await (0, dataDb_1.dbGetStudentById)(studentId, schoolId);
        if (!student) {
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
        const existingStudent = await (0, dataDb_1.dbFindStudentByAdmission)(schoolId, data.admissionNumber);
        if (existingStudent) {
            throw new errorHandler_1.AppError('Admission number already in use at this school', 400, 'BAD_REQUEST');
        }
        const school = await (0, dataDb_1.dbGetSchoolById)(schoolId);
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
        // Default password: Student@123 — must be changed on first login (future enforcement)
        const passwordHash = await bcryptjs_1.default.hash('Student@123', 10);
        const user = await (0, dataDb_1.dbCreateUser)({
            email: emailToUse,
            name: `${data.firstName} ${data.lastName}`.trim(), // Store display name
            passwordHash,
            role: 'STUDENT',
            schoolId, // ALWAYS the authenticated school — never from client
        });
        const student = await (0, dataDb_1.dbCreateStudent)({
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
        const existingStudent = await (0, dataDb_1.dbGetStudentById)(studentId, schoolId);
        if (!existingStudent) {
            throw new errorHandler_1.AppError('Student not found', 404, 'NOT_FOUND');
        }
        const student = await (0, dataDb_1.dbUpdateStudent)(studentId, schoolId, data);
        res.json({ success: true, data: student });
    }
    catch (error) {
        next(error);
    }
}
exports.updateStudent = updateStudent;
//# sourceMappingURL=students.controller.js.map