import { z } from 'zod';
export declare const requestTcSchema: z.ZodObject<{
    body: z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
        studentId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateTcStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            APPROVED: "APPROVED";
            ISSUED: "ISSUED";
            CANCELLED: "CANCELLED";
        }>;
        fileUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=tc.schema.d.ts.map