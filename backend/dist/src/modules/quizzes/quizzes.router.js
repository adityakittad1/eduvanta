"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizzesRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validate_1 = require("../../middleware/validate");
const quizzes_schema_1 = require("./quizzes.schema");
const quizzes_controller_1 = require("./quizzes.controller");
exports.quizzesRouter = (0, express_1.Router)();
exports.quizzesRouter.use(auth_controller_1.authenticate, auth_controller_1.requireSchool);
// Principals, Teachers and Students can view lists and details
exports.quizzesRouter.get('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER', 'STUDENT'), quizzes_controller_1.getQuizzes);
exports.quizzesRouter.get('/:id', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER', 'STUDENT'), quizzes_controller_1.getQuizById);
// Principals and Teachers can create and manage quizzes
exports.quizzesRouter.post('/', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(quizzes_schema_1.createQuizSchema), quizzes_controller_1.createQuiz);
exports.quizzesRouter.post('/:id/questions', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), (0, validate_1.validateRequest)(quizzes_schema_1.addQuestionSchema), quizzes_controller_1.addQuestion);
exports.quizzesRouter.patch('/:id/publish', (0, auth_controller_1.requireRole)('PRINCIPAL', 'TEACHER'), quizzes_controller_1.publishQuiz);
// Students can submit attempts
exports.quizzesRouter.post('/:id/submit', (0, auth_controller_1.requireRole)('STUDENT'), (0, validate_1.validateRequest)(quizzes_schema_1.submitQuizSchema), quizzes_controller_1.submitQuiz);
//# sourceMappingURL=quizzes.router.js.map