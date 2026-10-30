import { z } from 'zod';
export declare const createClassSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        division: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        academicYear: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createSubjectSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        code: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const assignTeacherSchema: z.ZodObject<{
    body: z.ZodObject<{
        teacherId: z.ZodString;
        subjectId: z.ZodString;
        academicYear: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const assignStudentsSchema: z.ZodObject<{
    body: z.ZodObject<{
        studentIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateClassInput = z.infer<typeof createClassSchema>['body'];
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>['body'];
export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>['body'];
export type AssignStudentsInput = z.infer<typeof assignStudentsSchema>['body'];
//# sourceMappingURL=classes.schema.d.ts.map