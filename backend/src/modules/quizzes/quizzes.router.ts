import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createQuizSchema, addQuestionSchema, submitQuizSchema } from './quizzes.schema';
import { getQuizzes, getQuizById, createQuiz, addQuestion, publishQuiz, submitQuiz } from './quizzes.controller';

export const quizzesRouter = Router();

quizzesRouter.use(authenticate, requireSchool);

// Principals, Teachers and Students can view lists and details
quizzesRouter.get('/', requireRole('PRINCIPAL', 'TEACHER', 'STUDENT'), getQuizzes);
quizzesRouter.get('/:id', requireRole('PRINCIPAL', 'TEACHER', 'STUDENT'), getQuizById);

// Principals and Teachers can create and manage quizzes
quizzesRouter.post('/', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(createQuizSchema), createQuiz);
quizzesRouter.post('/:id/questions', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(addQuestionSchema), addQuestion);
quizzesRouter.patch('/:id/publish', requireRole('PRINCIPAL', 'TEACHER'), publishQuiz);

// Students can submit attempts
quizzesRouter.post('/:id/submit', requireRole('STUDENT'), validateRequest(submitQuizSchema), submitQuiz);
