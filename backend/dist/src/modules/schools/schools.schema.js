"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchoolSchema = exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
exports.createSchoolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'School name is required'),
        address: zod_1.z.string().optional(),
        contactPhone: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        principalName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().url('Invalid URL for logo').optional().or(zod_1.z.literal('')),
    }),
});
exports.updateSchoolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'School name is required').optional(),
        address: zod_1.z.string().optional(),
        contactPhone: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        principalName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().url('Invalid URL for logo').optional().or(zod_1.z.literal('')),
        isActive: zod_1.z.boolean().optional(),
    }),
});
//# sourceMappingURL=schools.schema.js.map