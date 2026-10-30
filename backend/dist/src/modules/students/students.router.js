"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentsRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const students_schema_1 = require("./students.schema");
const students_controller_1 = require("./students.controller");
exports.studentsRouter = (0, express_1.Router)();
// Require valid authentication and school assignment for all student routes
exports.studentsRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Both PRINCIPAL and TEACHER can view students
exports.studentsRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), students_controller_1.getStudents);
exports.studentsRouter.get('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), students_controller_1.getStudentById);
// Only PRINCIPAL can create or update students
exports.studentsRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(students_schema_1.createStudentSchema), students_controller_1.createStudent);
exports.studentsRouter.put('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(students_schema_1.updateStudentSchema), students_controller_1.updateStudent);
//# sourceMappingURL=students.router.js.map