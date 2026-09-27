import { z } from 'zod';
import { ResourceType } from '@prisma/client';

export const createResourceSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    title: z.string().min(3, 'Title is required'),
    topic: z.string().optional(),
    description: z.string().optional(),
    fileUrl: z.string().min(1, 'File URL is required'),
    fileType: z.nativeEnum(ResourceType)
  })
});
