/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'SINGLE_MCQ' | 'MULTIPLE_MCQ' | 'FILL_BLANKS' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface QuestionItem {
  id: string;
  classNum: number;
  subject: string;
  subjectCode: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  marks: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C?: string;
    D?: string;
  };
  correctOption: string;
  explanation: string;
  createdAt: string;
}

export interface QuestionFilters {
  classNum?: number;
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CoverageItem {
  classNum: number;
  subject: string;
  subjectCode: string;
  targetCount: number;
  totalCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  singleMcqCount: number;
  multipleMcqCount: number;
  fillBlanksCount: number;
  trueFalseCount: number;
  shortAnswerCount: number;
}

export interface GenerateQuizFromBankInput {
  title: string;
  topic?: string;
  classId: string;
  subjectId: string;
  mode: 'BALANCED' | 'AUTO' | 'MANUAL';
  totalQuestions?: number;
  difficultyDistribution?: {
    easy?: number;
    medium?: number;
    hard?: number;
  };
  questionIds?: string[];
  classNum?: number;
  subject?: string;
}
