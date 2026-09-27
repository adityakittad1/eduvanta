import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { 
  createClassSchema, 
  createSubjectSchema, 
  assignTeacherSchema, 
  assignStudentsSchema 
} from './classes.schema';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  createSubject, 
  assignTeacher, 
  assignStudents 
} from './classes.controller';

export const classesRouter = Router();

classesRouter.use(authenticate, requireSchool);

// Teachers can view classes, but only Principals can modify them
classesRouter.get('/', requireRole('PRINCIPAL', 'TEACHER'), getClasses);
classesRouter.get('/:id', requireRole('PRINCIPAL', 'TEACHER'), getClassById);

classesRouter.post('/', requireRole('PRINCIPAL'), validateRequest(createClassSchema), createClass);
classesRouter.post('/:id/subjects', requireRole('PRINCIPAL'), validateRequest(createSubjectSchema), createSubject);
classesRouter.post('/:id/assign-teacher', requireRole('PRINCIPAL'), validateRequest(assignTeacherSchema), assignTeacher);
classesRouter.post('/:id/assign-students', requireRole('PRINCIPAL'), validateRequest(assignStudentsSchema), assignStudents);
