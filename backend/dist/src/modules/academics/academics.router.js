"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.academicsRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const academics_schema_1 = require("./academics.schema");
const academics_controller_1 = require("./academics.controller");
exports.academicsRouter = (0, express_1.Router)();
exports.academicsRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Principals and Teachers can manage assessments
exports.academicsRouter.post('/assessments', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(academics_schema_1.createAssessmentSchema), academics_controller_1.createAssessment);
exports.academicsRouter.get('/assessments', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER', 'STUDENT'), academics_controller_1.getAssessments);
exports.academicsRouter.get('/assessments/:id', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), academics_controller_1.getAssessmentById);
// Manage Marks
exports.academicsRouter.post('/assessments/:id/marks', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(academics_schema_1.saveMarksSchema), academics_controller_1.saveMarks);
exports.academicsRouter.get('/assessments/:id/marks', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), academics_controller_1.getMarksForAssessment);
// Student Academic Overview (Everyone can view, role logic in controller limits student access)
exports.academicsRouter.get('/student/:studentId', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER', 'STUDENT'), academics_controller_1.getStudentAcademics);
//# sourceMappingURL=academics.router.js.map