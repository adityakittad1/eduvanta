"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAi = void 0;
const errorHandler_1 = require("../../middleware/errorHandler");
const ai_service_1 = require("./ai.service");
async function askAi(req, res, next) {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            throw new errorHandler_1.AppError('Prompt is required', 400, 'BAD_REQUEST');
        }
        const user = {
            userId: req.user.id,
            role: req.user.role,
            name: req.user.name,
            email: req.user.email,
        };
        const aiResponse = await (0, ai_service_1.processAiPrompt)(prompt, schoolId, user);
        res.json({ success: true, data: { response: aiResponse } });
    }
    catch (error) {
        next(error);
    }
}
exports.askAi = askAi;
//# sourceMappingURL=ai.controller.js.map