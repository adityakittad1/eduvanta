"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = exports.publishQuiz = exports.addQuestion = exports.createQuiz = exports.getQuizById = exports.getQuizzes = void 0;
const prisma_1 = require("../../lib/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const logger_1 = require("../../lib/logger");
async function getQuizzes(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const role = req.user?.role;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        let where = { schoolId };
        if (role === 'STUDENT') {
            // Students only see published quizzes for their class
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user?.id } });
            if (!student || !student.classId) {
                res.json({ success: true, data: [] });
                return;
            }
            where.classId = student.classId;
            where.isPublished = true;
        }
        else if (role === 'TEACHER') {
            const teacher = await prisma_1.prisma.teacher.findUnique({ where: { userId: req.user?.id } });
            if (teacher) {
                where.createdByTeacherId = teacher.id;
            }
        }
        const quizzes = await prisma_1.prisma.quizDefinition.findMany({
            where,
            include: {
                class: { select: { name: true, division: true } },
                subject: { select: { name: true } },
                _count: { select: { questions: true, attempts: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: quizzes });
    }
    catch (error) {
        next(error);
    }
}
exports.getQuizzes = getQuizzes;
async function getQuizById(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const quizId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const quiz = await prisma_1.prisma.quizDefinition.findUnique({
            where: { id: quizId },
            include: {
                class: { select: { name: true, division: true } },
                subject: { select: { name: true } },
                questions: {
                    orderBy: { order: 'asc' },
                    // Don't send correctOption to students!
                    select: {
                        id: true,
                        questionText: true,
                        optionA: true,
                        optionB: true,
                        optionC: true,
                        optionD: true,
                        order: true,
                        correctOption: req.user?.role !== 'STUDENT'
                    }
                },
                attempts: req.user?.role !== 'STUDENT' ? {
                    include: {
                        student: { select: { firstName: true, lastName: true, admissionNumber: true } }
                    },
                    orderBy: { score: 'desc' }
                } : false
            }
        });
        if (!quiz || quiz.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Quiz not found', 404, 'NOT_FOUND');
        }
        // If student, check if they already attempted
        let studentAttempt = null;
        if (req.user?.role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user.id } });
            if (student) {
                studentAttempt = await prisma_1.prisma.quizAttempt.findUnique({
                    where: { quizId_studentId: { quizId, studentId: student.id } }
                });
            }
        }
        res.json({ success: true, data: { ...quiz, studentAttempt } });
    }
    catch (error) {
        next(error);
    }
}
exports.getQuizById = getQuizById;
async function createQuiz(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        let teacher = await prisma_1.prisma.teacher.findUnique({ where: { userId: req.user?.id } });
        if (!teacher && req.user?.role === 'PRINCIPAL') {
            teacher = await prisma_1.prisma.teacher.findFirst({ where: { schoolId } });
        }
        if (!teacher)
            throw new errorHandler_1.AppError('Teacher profile not found', 404, 'NOT_FOUND');
        const quiz = await prisma_1.prisma.quizDefinition.create({
            data: {
                schoolId,
                classId: data.classId,
                subjectId: data.subjectId,
                title: data.title,
                topic: data.topic || null,
                createdByTeacherId: teacher.id,
            }
        });
        res.status(201).json({ success: true, data: quiz });
    }
    catch (error) {
        next(error);
    }
}
exports.createQuiz = createQuiz;
async function addQuestion(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const quizId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const data = req.body;
        const quiz = await prisma_1.prisma.quizDefinition.findUnique({ where: { id: quizId } });
        if (!quiz || quiz.schoolId !== schoolId) {
            throw new errorHandler_1.AppError('Quiz not found', 404, 'NOT_FOUND');
        }
        const question = await prisma_1.prisma.quizQuestion.create({
            data: {
                quizId,
                questionText: data.questionText,
                optionA: data.optionA,
                optionB: data.optionB,
                optionC: data.optionC || null,
                optionD: data.optionD || null,
                correctOption: data.correctOption,
                order: data.order || 0
            }
        });
        res.status(201).json({ success: true, data: question });
    }
    catch (error) {
        next(error);
    }
}
exports.addQuestion = addQuestion;
async function publishQuiz(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const quizId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const quiz = await prisma_1.prisma.quizDefinition.updateMany({
            where: { id: quizId, schoolId },
            data: { isPublished: true }
        });
        if (quiz.count === 0) {
            throw new errorHandler_1.AppError('Quiz not found', 404, 'NOT_FOUND');
        }
        res.json({ success: true, message: 'Quiz published successfully' });
    }
    catch (error) {
        next(error);
    }
}
exports.publishQuiz = publishQuiz;
async function submitQuiz(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        const quizId = req.params.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        const student = await prisma_1.prisma.student.findUnique({ where: { userId: req.user?.id } });
        if (!student)
            throw new errorHandler_1.AppError('Student profile not found', 404, 'NOT_FOUND');
        const data = req.body;
        // Check if already attempted
        const existingAttempt = await prisma_1.prisma.quizAttempt.findUnique({
            where: { quizId_studentId: { quizId, studentId: student.id } }
        });
        if (existingAttempt) {
            throw new errorHandler_1.AppError('You have already attempted this quiz.', 400, 'BAD_REQUEST');
        }
        // Get all questions with correct answers
        const questions = await prisma_1.prisma.quizQuestion.findMany({ where: { quizId } });
        let score = 0;
        const maxScore = questions.length; // 1 point per question for now
        // Evaluate answers
        data.answers.forEach(answer => {
            const q = questions.find(q => q.id === answer.questionId);
            if (q && q.correctOption === answer.selectedOption) {
                score += 1;
            }
        });
        // Record attempt
        const attempt = await prisma_1.prisma.quizAttempt.create({
            data: {
                schoolId,
                quizId,
                studentId: student.id,
                score,
                maxScore
            }
        });
        // Triggers early warning evaluation if score is very low (e.g., < 40%)
        if ((score / maxScore) < 0.4) {
            // Create early warning flag
            await prisma_1.prisma.earlyWarningFlag.create({
                data: {
                    schoolId,
                    studentId: student.id,
                    flagType: 'LOW_QUIZ_SCORES',
                    details: {
                        threshold: 40,
                        actual: Math.round((score / maxScore) * 100),
                        quizId,
                        note: 'Failed a recent quiz'
                    }
                }
            });
            logger_1.logger.info(`Generated LOW_QUIZ_SCORES flag for student ${student.id}`);
        }
        res.json({ success: true, data: attempt });
    }
    catch (error) {
        next(error);
    }
}
exports.submitQuiz = submitQuiz;
//# sourceMappingURL=quizzes.controller.js.map