import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createResourceSchema } from './resources.schema';
import { getResources, createResource } from './resources.controller';

export const resourcesRouter = Router();

resourcesRouter.use(authenticate, requireSchool);

resourcesRouter.get('/', requireRole('PRINCIPAL', 'TEACHER', 'STUDENT'), getResources);
resourcesRouter.post('/', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(createResourceSchema), createResource);
