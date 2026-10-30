"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchoolProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateSchoolProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional().nullable(),
        logoUrl: zod_1.z.string().optional().nullable(),
        address: zod_1.z.string().optional().nullable(),
        contactPhone: zod_1.z.string().optional().nullable(),
        contactEmail: zod_1.z.string().optional().nullable(),
        principalName: zod_1.z.string().optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
        tagline: zod_1.z.string().optional().nullable(),
        establishedYear: zod_1.z.coerce.number().optional().nullable(),
        isPublicEnabled: zod_1.z.boolean().optional(),
    })
});
//# sourceMappingURL=school-profile.schema.js.map