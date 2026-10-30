"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAiSchema = void 0;
const zod_1 = require("zod");
exports.askAiSchema = zod_1.z.object({
    body: zod_1.z.object({
        prompt: zod_1.z.string().min(2, 'Prompt is required')
    })
});
//# sourceMappingURL=ai.schema.js.map