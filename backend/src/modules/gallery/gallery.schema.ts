import { z } from 'zod';
import { GalleryCategory } from '@prisma/client';

export const createGalleryItemSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().optional(),
    category: z.nativeEnum(GalleryCategory),
    fileUrl: z.string().min(1, 'File URL is required')
  })
});
