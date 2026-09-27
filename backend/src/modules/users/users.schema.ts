import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()).optional().or(z.literal('')),
    name: z.string().min(1, 'Full name is required').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.nativeEnum(Role, { message: 'Invalid role' }),
    schoolId: z.string().optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => {
    // SUPER_ADMIN has no school; all other roles MUST have a schoolId
    if (data.role !== 'SUPER_ADMIN' && !data.schoolId) {
      return false;
    }
    return true;
  }, {
    message: 'School assignment is required for Principal, Teacher, and Student roles',
    path: ['schoolId'],
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()).optional(),
    name: z.string().min(1).max(100).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.nativeEnum(Role, { message: 'Invalid role' }).optional(),
    schoolId: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
