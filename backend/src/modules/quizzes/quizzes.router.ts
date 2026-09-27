import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createQuizSchema, addQuestionSchema, submitQuizSchema } from './quizzes.schema';
import { getQuizzes, getQuizById, createQuiz, addQuestion, publishQuiz, submitQuiz } from './quizzes.controller';

export const quizzesRouter = Router();

quizzesRouter.use(authenticate, requireSchool);

// Both Teachers and Students can view lists and details
quizzesRouter.get('/', requireRole('TEACHER', 'STUDENT'), getQuizzes);
quizzesRouter.get('/:id', requireRole('TEACHER', 'STUDENT'), getQuizById);

// Teachers can create and manage quizzes
quizzesRouter.post('/', requireRole('TEACHER'), validateRequest(createQuizSchema), createQuiz);
quizzesRouter.post('/:id/questions', requireRole('TEACHER'), validateRequest(addQuestionSchema), addQuestion);
quizzesRouter.patch('/:id/publish', requireRole('TEACHER'), publishQuiz);

// Students can submit attempts
quizzesRouter.post('/:id/submit', requireRole('STUDENT'), validateRequest(submitQuizSchema), submitQuiz);
