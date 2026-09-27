import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createStudentSchema, updateStudentSchema } from './students.schema';
import { getStudents, getStudentById, createStudent, updateStudent } from './students.controller';

export const studentsRouter = Router();

// Require valid authentication and school assignment for all student routes
studentsRouter.use(authenticate, requireSchool);

// Both PRINCIPAL and TEACHER can view students
studentsRouter.get('/', requireRole('PRINCIPAL', 'TEACHER'), getStudents);
studentsRouter.get('/:id', requireRole('PRINCIPAL', 'TEACHER'), getStudentById);

// Only PRINCIPAL can create or update students
studentsRouter.post('/', requireRole('PRINCIPAL'), validateRequest(createStudentSchema), createStudent);
studentsRouter.put('/:id', requireRole('PRINCIPAL'), validateRequest(updateStudentSchema), updateStudent);
