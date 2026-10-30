"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const ai_schema_1 = require("./ai.schema");
const ai_controller_1 = require("./ai.controller");
exports.aiRouter = (0, express_1.Router)();
exports.aiRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
exports.aiRouter.post('/ask', (0, validate_1.validateRequest)(ai_schema_1.askAiSchema), ai_controller_1.askAi);
//# sourceMappingURL=ai.router.js.map