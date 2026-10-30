"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherSchema = exports.createTeacherSchema = void 0;
const zod_1 = require("zod");
exports.createTeacherSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        employeeId: zod_1.z.string().optional().or(zod_1.z.literal('')),
        qualification: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
exports.updateTeacherSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required').optional(),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
        employeeId: zod_1.z.string().optional().or(zod_1.z.literal('')),
        qualification: zod_1.z.string().optional().or(zod_1.z.literal('')),
        isActive: zod_1.z.boolean().optional(),
    }),
});
//# sourceMappingURL=teachers.schema.js.map