"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTcStatusSchema = exports.requestTcSchema = void 0;
const zod_1 = require("zod");
exports.requestTcSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string().optional(),
        studentId: zod_1.z.string().optional(),
    })
});
exports.updateTcStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['APPROVED', 'ISSUED', 'CANCELLED']),
        fileUrl: zod_1.z.string().optional()
    })
});
//# sourceMappingURL=tc.schema.js.map