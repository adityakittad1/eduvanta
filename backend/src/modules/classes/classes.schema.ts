import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Class name is required'),
    division: z.string().optional().or(z.literal('')),
    academicYear: z.string().min(1, 'Academic year is required'),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subject name is required'),
    code: z.string().optional().or(z.literal('')),
  }),
});

export const assignTeacherSchema = z.object({
  body: z.object({
    teacherId: z.string().min(1, 'Teacher ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    academicYear: z.string().min(1, 'Academic year is required'),
  }),
});

export const assignStudentsSchema = z.object({
  body: z.object({
    studentIds: z.array(z.string()).min(1, 'At least one student must be selected'),
  }),
});

export type CreateClassInput = z.infer<typeof createClassSchema>['body'];
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>['body'];
export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>['body'];
export type AssignStudentsInput = z.infer<typeof assignStudentsSchema>['body'];
