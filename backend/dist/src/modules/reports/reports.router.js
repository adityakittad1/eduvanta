"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const reports_controller_1 = require("./reports.controller");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
exports.reportsRouter.get('/dashboard', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), reports_controller_1.getDashboardStats);
//# sourceMappingURL=reports.router.js.map