import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { getDashboardStats } from './reports.controller';

export const reportsRouter = Router();

reportsRouter.use(authenticate, requireSchool);

reportsRouter.get('/dashboard', requireRole('PRINCIPAL', 'TEACHER'), getDashboardStats);
