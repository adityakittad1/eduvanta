/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { generateCuid } from '../../lib/dataDb';
import { AppError } from '../../middleware/errorHandler';
import {
  QuestionItem,
  QuestionFilters,
  CoverageItem,
  GenerateQuizFromBankInput,
} from './question-bank.types';

// Load question bank dataset
let questionBankCache: QuestionItem[] | null = null;

function loadQuestionBank(): QuestionItem[] {
  if (questionBankCache) return questionBankCache;

  const dataPath = path.resolve(__dirname, 'question-bank-data.json');
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    questionBankCache = JSON.parse(raw) as QuestionItem[];
  } else {
    questionBankCache = [];
  }
  return questionBankCache;
}

/**
 * Filter & search questions with pagination
 */
export function queryQuestionBank(filters: QuestionFilters) {
  const all = loadQuestionBank();
  let list = all;

  if (filters.classNum !== undefined && !isNaN(Number(filters.classNum))) {
    list = list.filter(q => q.classNum === Number(filters.classNum));
  }

  if (filters.subject) {
    const sLower = filters.subject.toLowerCase();
    list = list.filter(q => 
      q.subject.toLowerCase().includes(sLower) || 
      q.subjectCode.toLowerCase() === sLower
    );
  }

  if (filters.topic) {
    const tLower = filters.topic.toLowerCase();
    list = list.filter(q => q.topic.toLowerCase().includes(tLower));
  }

  if (filters.difficulty) {
    list = list.filter(q => q.difficulty === filters.difficulty);
  }

  if (filters.questionType) {
    list = list.filter(q => q.questionType === filters.questionType);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    list = list.filter(q =>
      q.questionText.toLowerCase().includes(searchLower) ||
      q.topic.toLowerCase().includes(searchLower) ||
      q.explanation.toLowerCase().includes(searchLower)
    );
  }

  const total = list.length;
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
  const offset = (page - 1) * limit;
  const items = list.slice(offset, offset + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Calculate coverage matrix across all classes and subjects
 */
export function getQuestionBankCoverage(): CoverageItem[] {
  const all = loadQuestionBank();
  const map = new Map<string, CoverageItem>();

  for (const q of all) {
    const key = `${q.classNum}-${q.subjectCode}`;
    let item = map.get(key);
    if (!item) {
      item = {
        classNum: q.classNum,
        subject: q.subject,
        subjectCode: q.subjectCode,
        targetCount: 100,
        totalCount: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        singleMcqCount: 0,
        multipleMcqCount: 0,
        fillBlanksCount: 0,
        trueFalseCount: 0,
        shortAnswerCount: 0,
      };
      map.set(key, item);
    }

    item.totalCount++;
    if (q.difficulty === 'EASY') item.easyCount++;
    if (q.difficulty === 'MEDIUM') item.mediumCount++;
    if (q.difficulty === 'HARD') item.hardCount++;

    if (q.questionType === 'SINGLE_MCQ') item.singleMcqCount++;
    if (q.questionType === 'MULTIPLE_MCQ') item.multipleMcqCount++;
    if (q.questionType === 'FILL_BLANKS') item.fillBlanksCount++;
    if (q.questionType === 'TRUE_FALSE') item.trueFalseCount++;
    if (q.questionType === 'SHORT_ANSWER') item.shortAnswerCount++;
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.classNum !== b.classNum) return a.classNum - b.classNum;
    return a.subject.localeCompare(b.subject);
  });
}

/**
 * Select questions based on quiz generation mode
 */
export function selectQuestionsForQuiz(input: GenerateQuizFromBankInput): QuestionItem[] {
  const all = loadQuestionBank();
  let candidatePool = all;

  // Filter pool by class number if provided
  if (input.classNum) {
    candidatePool = candidatePool.filter(q => q.classNum === input.classNum);
  }

  // Filter pool by subject if provided
  if (input.subject) {
    const sLower = input.subject.toLowerCase();
    candidatePool = candidatePool.filter(q => 
      q.subject.toLowerCase().includes(sLower) || 
      q.subjectCode.toLowerCase() === sLower
    );
  }

  // Filter by topic if specified
  if (input.topic) {
    const tLower = input.topic.toLowerCase();
    const topicFiltered = candidatePool.filter(q => q.topic.toLowerCase().includes(tLower));
    if (topicFiltered.length >= 10) candidatePool = topicFiltered;
  }

  // Method A: MANUAL selection
  if (input.mode === 'MANUAL') {
    if (!input.questionIds || input.questionIds.length === 0) {
      throw new AppError('Manual mode requires at least one question ID', 400, 'BAD_REQUEST');
    }
    const idSet = new Set(input.questionIds);
    return all.filter(q => idSet.has(q.id));
  }

  // Method C: BALANCED Preset (e.g. 20 questions: 8 Easy, 8 Medium, 4 Hard = 40% Easy, 40% Medium, 20% Hard)
  if (input.mode === 'BALANCED') {
    const total = input.totalQuestions || 20;
    const easyTarget = Math.round(total * 0.4);
    const mediumTarget = Math.round(total * 0.4);
    const hardTarget = total - easyTarget - mediumTarget;

    const easyPool = candidatePool.filter(q => q.difficulty === 'EASY');
    const mediumPool = candidatePool.filter(q => q.difficulty === 'MEDIUM');
    const hardPool = candidatePool.filter(q => q.difficulty === 'HARD');

    const shuffle = <T>(arr: T[]) => [...arr].sort(() => 0.5 - Math.random());

    const selected: QuestionItem[] = [
      ...shuffle(easyPool).slice(0, easyTarget),
      ...shuffle(mediumPool).slice(0, mediumTarget),
      ...shuffle(hardPool).slice(0, hardTarget),
    ];

    // If balanced selection fell short, fill remaining from remaining pool
    if (selected.length < total) {
      const selectedIds = new Set(selected.map(s => s.id));
      const leftovers = candidatePool.filter(q => !selectedIds.has(q.id));
      selected.push(...shuffle(leftovers).slice(0, total - selected.length));
    }

    return selected;
  }

  // Method B: AUTO Generation (custom distribution or random)
  const total = input.totalQuestions || 15;
  const easyTarget = input.difficultyDistribution?.easy ?? Math.round(total * 0.4);
  const mediumTarget = input.difficultyDistribution?.medium ?? Math.round(total * 0.4);
  const hardTarget = input.difficultyDistribution?.hard ?? (total - easyTarget - mediumTarget);

  const easyPool = candidatePool.filter(q => q.difficulty === 'EASY');
  const mediumPool = candidatePool.filter(q => q.difficulty === 'MEDIUM');
  const hardPool = candidatePool.filter(q => q.difficulty === 'HARD');

  const shuffle = <T>(arr: T[]) => [...arr].sort(() => 0.5 - Math.random());

  const selected: QuestionItem[] = [
    ...shuffle(easyPool).slice(0, easyTarget),
    ...shuffle(mediumPool).slice(0, mediumTarget),
    ...shuffle(hardPool).slice(0, hardTarget),
  ];

  if (selected.length < total) {
    const selectedIds = new Set(selected.map(s => s.id));
    const leftovers = candidatePool.filter(q => !selectedIds.has(q.id));
    selected.push(...shuffle(leftovers).slice(0, total - selected.length));
  }

  return selected;
}

/**
 * Persists the generated quiz and its questions to the database (Prisma or Supabase fallback)
 */
export async function createQuizFromQuestionBank(
  schoolId: string,
  teacherId: string,
  input: GenerateQuizFromBankInput
) {
  const selectedQuestions = selectQuestionsForQuiz(input);
  if (selectedQuestions.length === 0) {
    throw new AppError('No questions found matching criteria to create quiz', 400, 'BAD_REQUEST');
  }

  const quizId = generateCuid();
  const nowIso = new Date().toISOString();

  // 1. Try Prisma first if healthy
  if (isPrismaAvailable()) {
    try {
      const quiz = await prisma.quizDefinition.create({
        data: {
          id: quizId,
          schoolId,
          classId: input.classId,
          subjectId: input.subjectId,
          title: input.title,
          topic: input.topic || null,
          createdByTeacherId: teacherId,
          isPublished: true,
          questions: {
            create: selectedQuestions.map((q, idx) => ({
              id: generateCuid(),
              questionText: `${q.questionText} [${q.difficulty} | ${q.questionType}]`,
              optionA: q.options.A,
              optionB: q.options.B,
              optionC: q.options.C || '',
              optionD: q.options.D || '',
              correctOption: q.correctOption.slice(0, 10),
              order: idx + 1,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      return {
        quiz,
        totalQuestions: selectedQuestions.length,
        questions: selectedQuestions,
      };
    } catch {
      markPrismaFailure();
    }
  }

  // 2. Supabase Fallback
  if (supabase) {
    const { data: newQuiz, error: qErr } = await supabase
      .from('quiz_definitions')
      .insert({
        id: quizId,
        school_id: schoolId,
        class_id: input.classId,
        subject_id: input.subjectId,
        title: input.title,
        topic: input.topic || null,
        created_by_teacher_id: teacherId,
        is_published: true,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select()
      .single();

    if (qErr) {
      throw new AppError('Failed to create quiz definition in database: ' + qErr.message, 500, 'INTERNAL_ERROR');
    }

    const questionInserts = selectedQuestions.map((q, idx) => ({
      id: generateCuid(),
      quiz_id: quizId,
      question_text: `${q.questionText} [${q.difficulty} | ${q.questionType}]`,
      option_a: q.options.A,
      option_b: q.options.B,
      option_c: q.options.C || '',
      option_d: q.options.D || '',
      correct_option: q.correctOption.slice(0, 10),
      order: idx + 1,
    }));

    const { error: qqErr } = await supabase.from('quiz_questions').insert(questionInserts);
    if (qqErr) {
      throw new AppError('Failed to insert quiz questions: ' + qqErr.message, 500, 'INTERNAL_ERROR');
    }

    return {
      quiz: {
        id: newQuiz.id,
        schoolId: newQuiz.school_id,
        classId: newQuiz.class_id,
        subjectId: newQuiz.subject_id,
        title: newQuiz.title,
        topic: newQuiz.topic,
        isPublished: newQuiz.is_published,
        createdAt: newQuiz.created_at,
      },
      totalQuestions: selectedQuestions.length,
      questions: selectedQuestions,
    };
  }

  throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
}
