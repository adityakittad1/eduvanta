import { z } from 'zod';
export declare const updateSchoolProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        logoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        contactPhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        contactEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        principalName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        tagline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        establishedYear: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        isPublicEnabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=school-profile.schema.d.ts.map