import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { requestTcSchema, updateTcStatusSchema } from './tc.schema';
import { getTcs, requestTc, updateTcStatus } from './tc.controller';

export const tcRouter = Router();

tcRouter.use(authenticate, requireSchool);

tcRouter.get('/', getTcs);
tcRouter.post('/request', validateRequest(requestTcSchema), requestTc);
tcRouter.patch('/:id/status', requireRole('PRINCIPAL'), validateRequest(updateTcStatusSchema), updateTcStatus);
