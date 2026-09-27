import { z } from 'zod';

export const createSchoolSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'School name is required'),
    address: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    principalName: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().url('Invalid URL for logo').optional().or(z.literal('')),
  }),
});

export const updateSchoolSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'School name is required').optional(),
    address: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    principalName: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().url('Invalid URL for logo').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>['body'];
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>['body'];
