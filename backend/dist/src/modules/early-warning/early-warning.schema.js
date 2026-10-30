"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateRequestSchema = void 0;
const zod_1 = require("zod");
exports.evaluateRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        classId: zod_1.z.string().optional()
    })
});
//# sourceMappingURL=early-warning.schema.js.map