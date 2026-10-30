"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGalleryItemSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createGalleryItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title is required'),
        description: zod_1.z.string().optional(),
        category: zod_1.z.nativeEnum(client_1.GalleryCategory),
        fileUrl: zod_1.z.string().min(1, 'File URL is required')
    })
});
//# sourceMappingURL=gallery.schema.js.map