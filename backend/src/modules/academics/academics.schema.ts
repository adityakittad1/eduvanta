import { z } from 'zod';

export const createAssessmentSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    name: z.string().min(1, 'Assessment name is required'),
    type: z.enum(['UNIT_TEST', 'HALF_YEARLY', 'ANNUAL', 'PRACTICAL', 'PROJECT', 'OTHER']),
    maxMarks: z.number().min(1, 'Max marks must be greater than 0'),
    conductedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable(),
    academicYear: z.string().min(1, 'Academic year is required')
  }),
});

export const saveMarksSchema = z.object({
  body: z.object({
    records: z.array(z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      marksObtained: z.number().min(0, 'Marks cannot be negative'),
      remarks: z.string().optional()
    })).min(1, 'At least one mark record is required')
  }),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>['body'];
export type SaveMarksInput = z.infer<typeof saveMarksSchema>['body'];
