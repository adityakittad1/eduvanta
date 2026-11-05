import { z } from 'zod';
import { NoticeTarget } from '@prisma/client';

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Notice title is required'),
    content: z.string().trim().min(1, 'Notice content is required'),
    targetAudience: z.nativeEnum(NoticeTarget),
    targetClassId: z.string().optional().nullable(),
    visibility: z.enum(['INTERNAL', 'PUBLIC']).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  }).refine(data => {
    if (data.targetAudience === NoticeTarget.CLASS && !data.targetClassId) {
      return false;
    }
    return true;
  }, {
    message: 'Target class is required when audience is CLASS',
    path: ['targetClassId']
  })
});
