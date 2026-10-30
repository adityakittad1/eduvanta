import { z } from 'zod';
export declare const createResourceSchema: z.ZodObject<{
    body: z.ZodObject<{
        classId: z.ZodString;
        subjectId: z.ZodString;
        title: z.ZodString;
        topic: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodString;
        fileType: z.ZodEnum<{
            PDF: "PDF";
            IMAGE: "IMAGE";
            VIDEO: "VIDEO";
            DOCUMENT: "DOCUMENT";
            OTHER: "OTHER";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=resources.schema.d.ts.map