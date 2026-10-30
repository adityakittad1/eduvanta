"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.earlyWarningRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const early_warning_schema_1 = require("./early-warning.schema");
const early_warning_controller_1 = require("./early-warning.controller");
exports.earlyWarningRouter = (0, express_1.Router)();
exports.earlyWarningRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Both Principals and Teachers can view flags and run evaluations
exports.earlyWarningRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), early_warning_controller_1.getFlags);
exports.earlyWarningRouter.post('/evaluate', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(early_warning_schema_1.evaluateRequestSchema), early_warning_controller_1.runEvaluation);
//# sourceMappingURL=early-warning.router.js.map