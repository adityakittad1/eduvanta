import { z } from 'zod';
export declare const updateSchoolProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        contactPhone: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        principalName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        logoUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addFacilitySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addAchievementSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>['body'];
export type AddFacilityInput = z.infer<typeof addFacilitySchema>['body'];
export type AddAchievementInput = z.infer<typeof addAchievementSchema>['body'];
//# sourceMappingURL=profile.schema.d.ts.map