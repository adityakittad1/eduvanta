import { z } from 'zod';
export declare const createNoticeSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        content: z.ZodString;
        targetAudience: z.ZodEnum<{
            ALL: "ALL";
            TEACHERS: "TEACHERS";
            STUDENTS: "STUDENTS";
            CLASS: "CLASS";
        }>;
        targetClassId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=notices.schema.d.ts.map