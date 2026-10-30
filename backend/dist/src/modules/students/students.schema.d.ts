import { z } from 'zod';
export declare const createStudentSchema: z.ZodObject<{
    body: z.ZodObject<{
        admissionNumber: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        gender: z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
            OTHER: "OTHER";
        }>>;
        address: z.ZodOptional<z.ZodString>;
        guardianName: z.ZodOptional<z.ZodString>;
        guardianPhone: z.ZodOptional<z.ZodString>;
        academicYear: z.ZodString;
        classId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateStudentSchema: z.ZodObject<{
    body: z.ZodObject<{
        admissionNumber: z.ZodOptional<z.ZodString>;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        gender: z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
            OTHER: "OTHER";
        }>>;
        address: z.ZodOptional<z.ZodString>;
        guardianName: z.ZodOptional<z.ZodString>;
        guardianPhone: z.ZodOptional<z.ZodString>;
        academicYear: z.ZodOptional<z.ZodString>;
        classId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
//# sourceMappingURL=students.schema.d.ts.map