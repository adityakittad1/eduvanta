"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const classes_schema_1 = require("./classes.schema");
const classes_controller_1 = require("./classes.controller");
exports.classesRouter = (0, express_1.Router)();
exports.classesRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Teachers can view classes, but only Principals can modify them
exports.classesRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), classes_controller_1.getClasses);
exports.classesRouter.get('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), classes_controller_1.getClassById);
exports.classesRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(classes_schema_1.createClassSchema), classes_controller_1.createClass);
exports.classesRouter.post('/:id/subjects', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(classes_schema_1.createSubjectSchema), classes_controller_1.createSubject);
exports.classesRouter.post('/:id/assign-teacher', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(classes_schema_1.assignTeacherSchema), classes_controller_1.assignTeacher);
exports.classesRouter.post('/:id/assign-students', (0, auth_controller_1.requireRole)('PRINCIPAL'), (0, validate_1.validateRequest)(classes_schema_1.assignStudentsSchema), classes_controller_1.assignStudents);
//# sourceMappingURL=classes.router.js.map