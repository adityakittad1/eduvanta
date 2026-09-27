import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { evaluateRequestSchema } from './early-warning.schema';
import { getFlags, runEvaluation } from './early-warning.controller';

export const earlyWarningRouter = Router();

earlyWarningRouter.use(authenticate, requireSchool);

// Both Principals and Teachers can view flags and run evaluations
earlyWarningRouter.get('/', requireRole('PRINCIPAL', 'TEACHER'), getFlags);
earlyWarningRouter.post('/evaluate', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(evaluateRequestSchema), runEvaluation);
