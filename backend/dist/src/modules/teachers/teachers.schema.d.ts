import { z } from 'zod';
export declare const createTeacherSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        firstName: z.ZodString;
        lastName: z.ZodString;
        employeeId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        qualification: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateTeacherSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        employeeId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        qualification: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>['body'];
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>['body'];
//# sourceMappingURL=teachers.schema.d.ts.map