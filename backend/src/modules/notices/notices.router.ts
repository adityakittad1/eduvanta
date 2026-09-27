import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createNoticeSchema } from './notices.schema';
import { getNotices, createNotice } from './notices.controller';

export const noticesRouter = Router();

noticesRouter.use(authenticate, requireSchool);

noticesRouter.get('/', getNotices);
noticesRouter.post('/', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(createNoticeSchema), createNotice);
