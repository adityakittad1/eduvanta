import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createTeacherSchema, updateTeacherSchema } from './teachers.schema';
import { getTeachers, getTeacherById, createTeacher, updateTeacher } from './teachers.controller';

export const teachersRouter = Router();

// Require valid authentication and school assignment for all teacher routes
teachersRouter.use(authenticate, requireSchool);

// Only PRINCIPAL can view, create, or update teachers
teachersRouter.get('/', requireRole('PRINCIPAL'), getTeachers);
teachersRouter.get('/:id', requireRole('PRINCIPAL'), getTeacherById);
teachersRouter.post('/', requireRole('PRINCIPAL'), validateRequest(createTeacherSchema), createTeacher);
teachersRouter.put('/:id', requireRole('PRINCIPAL'), validateRequest(updateTeacherSchema), updateTeacher);
