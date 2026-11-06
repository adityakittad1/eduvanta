/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';
import {
  queryQuestionBank,
  getQuestionBankCoverage,
  createQuizFromQuestionBank,
} from './question-bank.service';
import { QuestionFilters, GenerateQuizFromBankInput } from './question-bank.types';

export async function getQuestionBankItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: QuestionFilters = {
      classNum: req.query.classNum ? Number(req.query.classNum) : undefined,
      subject: req.query.subject ? String(req.query.subject) : undefined,
      topic: req.query.topic ? String(req.query.topic) : undefined,
      difficulty: req.query.difficulty as any,
      questionType: req.query.questionType as any,
      search: req.query.search ? String(req.query.search) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = queryQuestionBank(filters);
    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

export async function getQuestionBankCoverageMatrix(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coverage = getQuestionBankCoverage();
    res.json({ success: true, data: coverage });
  } catch (error) {
    next(error);
  }
}

export async function generateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant?.id;
    if (!schoolId) throw new AppError('No tenant context', 400, 'BAD_REQUEST');

    const teacherId = req.user?.id;
    if (!teacherId) throw new AppError('Only teachers or principals can generate quizzes', 403, 'FORBIDDEN');

    const body: GenerateQuizFromBankInput = req.body;
    if (!body.title || !body.classId || !body.subjectId) {
      throw new AppError('Title, target class, and subject curriculum are required', 400, 'BAD_REQUEST');
    }

    const result = await createQuizFromQuestionBank(schoolId, teacherId, body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

