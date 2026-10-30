import { z } from 'zod';
import { Gender } from '@prisma/client';

export const createStudentSchema = z.object({
  body: z.object({
    admissionNumber: z.string().min(1, 'Admission number is required').transform(v => v.trim()),
    firstName: z.string().min(1, 'First name is required').transform(v => v.trim()),
    lastName: z.string().min(1, 'Last name is required').transform(v => v.trim()),
    dateOfBirth: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
    gender: z.nativeEnum(Gender).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
    address: z.string().optional().transform(v => v === '' ? undefined : v),
    guardianName: z.string().optional().transform(v => v === '' ? undefined : v),
    guardianPhone: z.string().optional().transform(v => v === '' ? undefined : v),
    academicYear: z.string().min(1, 'Academic year is required (e.g. 2026-2027)').transform(v => v.trim()),
    classId: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v), // Optional until Phase 7
    email: z.string().email('Valid email is required for login').optional().or(z.literal('')).transform(v => v === '' ? undefined : v), // Used to create User account
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    admissionNumber: z.string().min(1, 'Admission number is required').optional().transform(v => v ? v.trim() : undefined),
    firstName: z.string().min(1, 'First name is required').optional().transform(v => v ? v.trim() : undefined),
    lastName: z.string().min(1, 'Last name is required').optional().transform(v => v ? v.trim() : undefined),
    dateOfBirth: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
    gender: z.nativeEnum(Gender).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
    address: z.string().optional().transform(v => v === '' ? undefined : v),
    guardianName: z.string().optional().transform(v => v === '' ? undefined : v),
    guardianPhone: z.string().optional().transform(v => v === '' ? undefined : v),
    academicYear: z.string().optional().transform(v => v ? v.trim() : undefined),
    classId: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
    isActive: z.boolean().optional(),
  }),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
