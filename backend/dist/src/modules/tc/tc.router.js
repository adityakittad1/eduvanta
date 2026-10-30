"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tcRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const tc_schema_1 = require("./tc.schema");
const tc_controller_1 = require("./tc.controller");
exports.tcRouter = (0, express_1.Router)();
exports.tcRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
exports.tcRouter.get('/', tc_controller_1.getTcs);
exports.tcRouter.post('/request', (0, validate_1.validateRequest)(tc_schema_1.requestTcSchema), tc_controller_1.requestTc);
exports.tcRouter.patch('/:id/status', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(tc_schema_1.updateTcStatusSchema), tc_controller_1.updateTcStatus);
//# sourceMappingURL=tc.router.js.map