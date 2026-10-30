"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        admissionNumber: zod_1.z.string().min(1, 'Admission number is required'),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        dateOfBirth: zod_1.z.string().optional().or(zod_1.z.literal('')),
        gender: zod_1.z.nativeEnum(client_1.Gender).optional(),
        address: zod_1.z.string().optional(),
        guardianName: zod_1.z.string().optional(),
        guardianPhone: zod_1.z.string().optional(),
        academicYear: zod_1.z.string().min(1, 'Academic year is required (e.g. 2026-2027)'),
        classId: zod_1.z.string().optional().or(zod_1.z.literal('')), // Optional until Phase 7
        email: zod_1.z.string().email('Valid email is required for login').optional().or(zod_1.z.literal('')), // Used to create User account
    }),
});
exports.updateStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        admissionNumber: zod_1.z.string().min(1, 'Admission number is required').optional(),
        firstName: zod_1.z.string().min(1, 'First name is required').optional(),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
        dateOfBirth: zod_1.z.string().optional().or(zod_1.z.literal('')),
        gender: zod_1.z.nativeEnum(client_1.Gender).optional(),
        address: zod_1.z.string().optional(),
        guardianName: zod_1.z.string().optional(),
        guardianPhone: zod_1.z.string().optional(),
        academicYear: zod_1.z.string().optional(),
        classId: zod_1.z.string().optional().or(zod_1.z.literal('')),
        isActive: zod_1.z.boolean().optional(),
    }),
});
//# sourceMappingURL=students.schema.js.map