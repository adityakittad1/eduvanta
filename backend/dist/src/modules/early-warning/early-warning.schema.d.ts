import { z } from 'zod';
export declare const evaluateRequestSchema: z.ZodObject<{
    body: z.ZodObject<{
        classId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type EvaluateRequestInput = z.infer<typeof evaluateRequestSchema>['body'];
//# sourceMappingURL=early-warning.schema.d.ts.map