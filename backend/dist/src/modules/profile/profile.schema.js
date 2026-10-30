"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAchievementSchema = exports.addFacilitySchema = exports.updateSchoolProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateSchoolProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'School name is required').optional(),
        address: zod_1.z.string().optional(),
        contactPhone: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        principalName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().url('Invalid URL for logo').optional().or(zod_1.z.literal('')),
    }),
});
exports.addFacilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Facility name is required'),
        description: zod_1.z.string().optional(),
    }),
});
exports.addAchievementSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Achievement title is required'),
        description: zod_1.z.string().optional(),
        year: zod_1.z.number().int().min(1900).max(2100).optional(),
    }),
});
//# sourceMappingURL=profile.schema.js.map