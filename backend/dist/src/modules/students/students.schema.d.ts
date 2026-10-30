import { z } from 'zod';
export declare const createStudentSchema: z.ZodObject<{
    body: z.ZodObject<{
        admissionNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        firstName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        lastName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        dateOfBirth: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
        gender: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
            OTHER: "OTHER";
        }>>, z.ZodLiteral<"">]>, z.ZodTransform<"MALE" | "FEMALE" | "OTHER" | undefined, "" | "MALE" | "FEMALE" | "OTHER" | undefined>>;
        address: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        guardianName: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        guardianPhone: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        academicYear: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        classId: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
        email: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateStudentSchema: z.ZodObject<{
    body: z.ZodObject<{
        admissionNumber: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        firstName: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        lastName: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        dateOfBirth: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
        gender: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
            OTHER: "OTHER";
        }>>, z.ZodLiteral<"">]>, z.ZodTransform<"MALE" | "FEMALE" | "OTHER" | undefined, "" | "MALE" | "FEMALE" | "OTHER" | undefined>>;
        address: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        guardianName: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        guardianPhone: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        academicYear: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        classId: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
//# sourceMappingURL=students.schema.d.ts.map