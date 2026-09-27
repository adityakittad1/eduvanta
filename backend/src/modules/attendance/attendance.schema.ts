import { z } from 'zod';

export const markAttendanceSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    records: z.array(z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HOLIDAY']),
      remarks: z.string().optional()
    })).min(1, 'At least one attendance record is required')
  }),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>['body'];
