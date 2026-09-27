import { z } from 'zod';

export const evaluateRequestSchema = z.object({
  body: z.object({
    classId: z.string().optional()
  })
});

export type EvaluateRequestInput = z.infer<typeof evaluateRequestSchema>['body'];
