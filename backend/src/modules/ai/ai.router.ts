import { Router } from 'express';
import { authenticate, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { askAiSchema } from './ai.schema';
import { askAi } from './ai.controller';

export const aiRouter = Router();

aiRouter.use(authenticate, requireSchool);

aiRouter.post('/ask', validateRequest(askAiSchema), askAi);
