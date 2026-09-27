import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required for teacher login'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    employeeId: z.string().optional().or(z.literal('')),
    qualification: z.string().optional().or(z.literal('')),
  }),
});

export const updateTeacherSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    employeeId: z.string().optional().or(z.literal('')),
    qualification: z.string().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>['body'];
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>['body'];
