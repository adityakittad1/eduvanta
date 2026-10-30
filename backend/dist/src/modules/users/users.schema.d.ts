import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodUnion<[z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>, z.ZodLiteral<"">]>;
        name: z.ZodString;
        password: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<{
            SUPER_ADMIN: "SUPER_ADMIN";
            PRINCIPAL: "PRINCIPAL";
            TEACHER: "TEACHER";
            STUDENT: "STUDENT";
        }>;
        schoolId: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        name: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<{
            SUPER_ADMIN: "SUPER_ADMIN";
            PRINCIPAL: "PRINCIPAL";
            TEACHER: "TEACHER";
            STUDENT: "STUDENT";
        }>>;
        schoolId: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
//# sourceMappingURL=users.schema.d.ts.map