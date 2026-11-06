import { api } from '@/lib/api';

export interface QuizQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string | null;
  optionD: string | null;
  correctOption?: 'A' | 'B' | 'C' | 'D'; // Teachers get this, students don't until maybe review (not implemented)
  order: number;
}

export interface QuizAttempt {
  id: string;
  score: number;
  maxScore: number;
  student?: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string | null;
  isPublished: boolean;
  createdAt: string;
  class: { name: string; division: string | null };
  subject: { name: string };
  _count?: { questions: number; attempts: number };
  questions?: QuizQuestion[];
  attempts?: QuizAttempt[];
  studentAttempt?: QuizAttempt | null;
}

export const quizzesApi = {
  getQuizzes: async () => {
    const { data } = await api.get<{ success: boolean; data: Quiz[] }>('/quizzes');
    return data.data;
  },

  getQuizById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: Quiz }>(`/quizzes/${id}`);
    return data.data;
  },

  createQuiz: async (quizData: { classId: string; subjectId: string; title: string; topic?: string }) => {
    const { data } = await api.post<{ success: boolean; data: Quiz }>('/quizzes', quizData);
    return data.data;
  },

  addQuestion: async (quizId: string, questionData: Omit<QuizQuestion, 'id'>) => {
    const { data } = await api.post<{ success: boolean; data: QuizQuestion }>(`/quizzes/${quizId}/questions`, questionData);
    return data.data;
  },

  publishQuiz: async (quizId: string) => {
    const { data } = await api.patch<{ success: boolean }>(`/quizzes/${quizId}/publish`);
    return data;
  },

  submitQuiz: async (quizId: string, answers: { questionId: string; selectedOption: 'A' | 'B' | 'C' | 'D' }[]) => {
    const { data } = await api.post<{ success: boolean; data: QuizAttempt }>(`/quizzes/${quizId}/submit`, { answers });
    return data.data;
  },

  // ─── Question Bank ─────────────────────────────────────────────
  getQuestionBank: async (filters: {
    classNum?: number;
    subject?: string;
    topic?: string;
    difficulty?: string;
    questionType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<{
      success: boolean;
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/question-bank', { params: filters });
    return data;
  },

  getQuestionBankCoverage: async () => {
    const { data } = await api.get<{ success: boolean; data: any[] }>('/question-bank/coverage');
    return data.data;
  },

  generateQuizFromBank: async (payload: {
    title: string;
    topic?: string;
    classId: string;
    subjectId: string;
    mode: 'BALANCED' | 'AUTO' | 'MANUAL';
    totalQuestions?: number;
    difficultyDistribution?: { easy?: number; medium?: number; hard?: number };
    questionIds?: string[];
    classNum?: number;
    subject?: string;
  }) => {
    const { data } = await api.post<{
      success: boolean;
      data: {
        quiz: Quiz;
        totalQuestions: number;
        questions: any[];
      };
    }>('/question-bank/generate-quiz', payload);
    return data.data;
  },
};
