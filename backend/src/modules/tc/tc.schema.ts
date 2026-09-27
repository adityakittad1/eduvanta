import { z } from 'zod';

export const requestTcSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
    studentId: z.string().optional(),
  })
});

export const updateTcStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'ISSUED', 'CANCELLED']),
    fileUrl: z.string().optional()
  })
});
