import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createUserSchema, updateUserSchema } from './users.schema';
import {
  getAllUsers,
  createUser,
  updateUser,
} from './users.controller';

export const usersRouter = Router();

// Users routes are accessible by SUPER_ADMIN and PRINCIPAL.
// The controller enforces that PRINCIPAL can only manage their own school's users.
usersRouter.use(authenticate, requireRole('SUPER_ADMIN', 'PRINCIPAL'));

// GET /api/v1/users
usersRouter.get('/', getAllUsers);

// POST /api/v1/users
usersRouter.post('/', validateRequest(createUserSchema), createUser);

// PUT /api/v1/users/:id
usersRouter.put('/:id', validateRequest(updateUserSchema), updateUser);
