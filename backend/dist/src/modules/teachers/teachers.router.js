"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teachersRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const teachers_schema_1 = require("./teachers.schema");
const teachers_controller_1 = require("./teachers.controller");
exports.teachersRouter = (0, express_1.Router)();
// Require valid authentication and school assignment for all teacher routes
exports.teachersRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Only PRINCIPAL can view, create, or update teachers
exports.teachersRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), teachers_controller_1.getTeachers);
exports.teachersRouter.get('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), teachers_controller_1.getTeacherById);
exports.teachersRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(teachers_schema_1.createTeacherSchema), teachers_controller_1.createTeacher);
exports.teachersRouter.put('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(teachers_schema_1.updateTeacherSchema), teachers_controller_1.updateTeacher);
//# sourceMappingURL=teachers.router.js.map