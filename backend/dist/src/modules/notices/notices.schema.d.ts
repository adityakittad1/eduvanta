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
        targetClassId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            INTERNAL: "INTERNAL";
            PUBLIC: "PUBLIC";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            DRAFT: "DRAFT";
            PUBLISHED: "PUBLISHED";
            ARCHIVED: "ARCHIVED";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=notices.schema.d.ts.map