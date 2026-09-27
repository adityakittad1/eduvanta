import { z } from 'zod';

export const createQuizSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    topic: z.string().optional()
  })
});

export const addQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(1, 'Question text is required'),
    optionA: z.string().min(1, 'Option A is required'),
    optionB: z.string().min(1, 'Option B is required'),
    optionC: z.string().optional(),
    optionD: z.string().optional(),
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    order: z.number().int().optional().default(0)
  })
});

export const submitQuizSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: z.string(),
      selectedOption: z.enum(['A', 'B', 'C', 'D'])
    }))
  })
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>['body'];
export type AddQuestionInput = z.infer<typeof addQuestionSchema>['body'];
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>['body'];
