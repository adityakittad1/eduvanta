/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth.controller';
import {
  getQuestionBankItems,
  getQuestionBankCoverageMatrix,
  generateQuiz,
} from './question-bank.controller';

export const questionBankRouter = Router();

questionBankRouter.use(authenticate);

// Browse questions
questionBankRouter.get('/', requireRole('PRINCIPAL', 'TEACHER'), getQuestionBankItems);

// View coverage
questionBankRouter.get('/coverage', requireRole('PRINCIPAL', 'TEACHER'), getQuestionBankCoverageMatrix);

// Generate quiz from question bank (Manual, Auto, Balanced)
questionBankRouter.post('/generate-quiz', requireRole('PRINCIPAL', 'TEACHER'), generateQuiz);
