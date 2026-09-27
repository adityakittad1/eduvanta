import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createSchoolSchema, updateSchoolSchema } from './schools.schema';
import {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
} from './schools.controller';

export const schoolsRouter = Router();

// All school routes are restricted to SUPER_ADMIN only
schoolsRouter.use(authenticate, requireRole('SUPER_ADMIN'));

// GET /api/v1/schools
schoolsRouter.get('/', getAllSchools);

// GET /api/v1/schools/:id
schoolsRouter.get('/:id', getSchoolById);

// POST /api/v1/schools
schoolsRouter.post('/', validateRequest(createSchoolSchema), createSchool);

// PUT /api/v1/schools/:id
schoolsRouter.put('/:id', validateRequest(updateSchoolSchema), updateSchool);
