"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createResourceSchema = zod_1.z.object({
    body: zod_1.z.object({
        classId: zod_1.z.string().min(1, 'Class ID is required'),
        subjectId: zod_1.z.string().min(1, 'Subject ID is required'),
        title: zod_1.z.string().min(3, 'Title is required'),
        topic: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        fileUrl: zod_1.z.string().min(1, 'File URL is required'),
        fileType: zod_1.z.nativeEnum(client_1.ResourceType)
    })
});
//# sourceMappingURL=resources.schema.js.map