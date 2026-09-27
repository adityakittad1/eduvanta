import { z } from 'zod';
import { Gender } from '@prisma/client';

export const createStudentSchema = z.object({
  body: z.object({
    admissionNumber: z.string().min(1, 'Admission number is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().optional().or(z.literal('')),
    gender: z.nativeEnum(Gender).optional(),
    address: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    academicYear: z.string().min(1, 'Academic year is required (e.g. 2026-2027)'),
    classId: z.string().optional().or(z.literal('')), // Optional until Phase 7
    email: z.string().email('Valid email is required for login').optional().or(z.literal('')), // Used to create User account
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    admissionNumber: z.string().min(1, 'Admission number is required').optional(),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    dateOfBirth: z.string().optional().or(z.literal('')),
    gender: z.nativeEnum(Gender).optional(),
    address: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    academicYear: z.string().optional(),
    classId: z.string().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
