import { z } from 'zod';
export declare const createSchoolSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        contactPhone: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        principalName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        logoUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateSchoolSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        contactPhone: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        principalName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        logoUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>['body'];
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>['body'];
//# sourceMappingURL=schools.schema.d.ts.map