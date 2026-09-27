import { z } from 'zod';

export const updateSchoolProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'School name is required').optional(),
    address: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    principalName: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().url('Invalid URL for logo').optional().or(z.literal('')),
  }),
});

export const addFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Facility name is required'),
    description: z.string().optional(),
  }),
});

export const addAchievementSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Achievement title is required'),
    description: z.string().optional(),
    year: z.number().int().min(1900).max(2100).optional(),
  }),
});

export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>['body'];
export type AddFacilityInput = z.infer<typeof addFacilitySchema>['body'];
export type AddAchievementInput = z.infer<typeof addAchievementSchema>['body'];
