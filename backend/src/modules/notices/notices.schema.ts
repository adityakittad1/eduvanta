import { z } from 'zod';
import { NoticeTarget } from '@prisma/client';

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    content: z.string().min(5, 'Content is required'),
    targetAudience: z.nativeEnum(NoticeTarget),
    targetClassId: z.string().optional()
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
