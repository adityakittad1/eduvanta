import { z } from 'zod';

export const updateSchoolProfileSchema = z.object({
  body: z.object({
    name: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    contactEmail: z.string().optional().nullable(),
    principalName: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    tagline: z.string().optional().nullable(),
    establishedYear: z.coerce.number().optional().nullable(),
    isPublicEnabled: z.boolean().optional(),
  })
});
