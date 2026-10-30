import { z } from 'zod';
export declare const createAssessmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        classId: z.ZodString;
        subjectId: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<{
            OTHER: "OTHER";
            UNIT_TEST: "UNIT_TEST";
            HALF_YEARLY: "HALF_YEARLY";
            ANNUAL: "ANNUAL";
            PRACTICAL: "PRACTICAL";
            PROJECT: "PROJECT";
        }>;
        maxMarks: z.ZodNumber;
        conductedDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        academicYear: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const saveMarksSchema: z.ZodObject<{
    body: z.ZodObject<{
        records: z.ZodArray<z.ZodObject<{
            studentId: z.ZodString;
            marksObtained: z.ZodNumber;
            remarks: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>['body'];
export type SaveMarksInput = z.infer<typeof saveMarksSchema>['body'];
//# sourceMappingURL=academics.schema.d.ts.map