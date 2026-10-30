"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()).optional().or(zod_1.z.literal('')),
        name: zod_1.z.string().min(1, 'Full name is required').max(100),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters').optional(),
        role: zod_1.z.nativeEnum(client_1.Role, { message: 'Invalid role' }),
        schoolId: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }).refine((data) => {
        // SUPER_ADMIN has no school; all other roles MUST have a schoolId
        if (data.role !== 'SUPER_ADMIN' && !data.schoolId) {
            return false;
        }
        return true;
    }, {
        message: 'School assignment is required for Principal, Teacher, and Student roles',
        path: ['schoolId'],
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()).optional(),
        name: zod_1.z.string().min(1).max(100).optional(),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters').optional(),
        role: zod_1.z.nativeEnum(client_1.Role, { message: 'Invalid role' }).optional(),
        schoolId: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
//# sourceMappingURL=users.schema.js.map