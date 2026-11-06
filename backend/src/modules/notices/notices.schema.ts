import { z } from 'zod';

const audienceMapping: Record<string, 'ALL' | 'TEACHERS' | 'STUDENTS' | 'CLASS'> = {
  ALL: 'ALL',
  'Entire School': 'ALL',
  'Entire Campus (All)': 'ALL',
  TEACHERS: 'TEACHERS',
  'Faculty & Staff Only': 'TEACHERS',
  'All Teachers': 'TEACHERS',
  STUDENTS: 'STUDENTS',
  'Students & Parents Only': 'STUDENTS',
  'All Students': 'STUDENTS',
  CLASS: 'CLASS',
  'Specific Class': 'CLASS',
  'Specific Class / Section': 'CLASS',
};

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Notice title is required'),
    content: z.string().trim().min(1, 'Notice content is required'),
    targetAudience: z.string().transform((val, ctx) => {
      const mapped = audienceMapping[val] || (['ALL', 'TEACHERS', 'STUDENTS', 'CLASS'].includes(val.toUpperCase()) ? val.toUpperCase() : null);
      if (!mapped) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid target audience. Choose Entire School, Teachers, Students, or Class.',
        });
        return 'ALL';
      }
      return mapped as 'ALL' | 'TEACHERS' | 'STUDENTS' | 'CLASS';
    }),
    targetClassId: z.string().optional().nullable(),
    visibility: z.enum(['INTERNAL', 'PUBLIC']).optional().default('INTERNAL'),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('PUBLISHED'),
  }).refine(data => {
    if (data.targetAudience === 'CLASS' && !data.targetClassId) {
      return false;
    }
    return true;
  }, {
    message: 'Target class is required when audience is CLASS',
    path: ['targetClassId']
  })
});
