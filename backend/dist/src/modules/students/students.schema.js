"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        admissionNumber: zod_1.z.string().min(1, 'Admission number is required').transform(v => v.trim()),
        firstName: zod_1.z.string().min(1, 'First name is required').transform(v => v.trim()),
        lastName: zod_1.z.string().min(1, 'Last name is required').transform(v => v.trim()),
        dateOfBirth: zod_1.z.string().optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
        gender: zod_1.z.nativeEnum(client_1.Gender).optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
        address: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
        guardianName: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
        guardianPhone: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
        academicYear: zod_1.z.string().min(1, 'Academic year is required (e.g. 2026-2027)').transform(v => v.trim()),
        classId: zod_1.z.string().optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v), // Optional until Phase 7
        email: zod_1.z.string().email('Valid email is required for login').optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v), // Used to create User account
    }),
});
exports.updateStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        admissionNumber: zod_1.z.string().min(1, 'Admission number is required').optional().transform(v => v ? v.trim() : undefined),
        firstName: zod_1.z.string().min(1, 'First name is required').optional().transform(v => v ? v.trim() : undefined),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional().transform(v => v ? v.trim() : undefined),
        dateOfBirth: zod_1.z.string().optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
        gender: zod_1.z.nativeEnum(client_1.Gender).optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
        address: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
        guardianName: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
        guardianPhone: zod_1.z.string().optional().transform(v => v === '' ? undefined : v),
        academicYear: zod_1.z.string().optional().transform(v => v ? v.trim() : undefined),
        classId: zod_1.z.string().optional().or(zod_1.z.literal('')).transform(v => v === '' ? undefined : v),
        isActive: zod_1.z.boolean().optional(),
    }),
});
//# sourceMappingURL=students.schema.js.map