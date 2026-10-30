"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoticeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createNoticeSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title is required'),
        content: zod_1.z.string().min(5, 'Content is required'),
        targetAudience: zod_1.z.nativeEnum(client_1.NoticeTarget),
        targetClassId: zod_1.z.string().optional()
    }).refine(data => {
        if (data.targetAudience === client_1.NoticeTarget.CLASS && !data.targetClassId) {
            return false;
        }
        return true;
    }, {
        message: 'Target class is required when audience is CLASS',
        path: ['targetClassId']
    })
});
//# sourceMappingURL=notices.schema.js.map