import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { createAssessmentSchema, saveMarksSchema } from './academics.schema';
import { 
  createAssessment, 
  getAssessments, 
  getAssessmentById,
  saveMarks, 
  getMarksForAssessment, 
  getStudentAcademics 
} from './academics.controller';

export const academicsRouter = Router();

academicsRouter.use(authenticate, requireSchool);

// Principals and Teachers can manage assessments
academicsRouter.post('/assessments', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(createAssessmentSchema), createAssessment);
academicsRouter.get('/assessments', requireRole('PRINCIPAL', 'TEACHER', 'STUDENT'), getAssessments);
academicsRouter.get('/assessments/:id', requireRole('PRINCIPAL', 'TEACHER'), getAssessmentById);

// Manage Marks
academicsRouter.post('/assessments/:id/marks', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(saveMarksSchema), saveMarks);
academicsRouter.get('/assessments/:id/marks', requireRole('PRINCIPAL', 'TEACHER'), getMarksForAssessment);

// Student Academic Overview (Everyone can view, role logic in controller limits student access)
academicsRouter.get('/student/:studentId', requireRole('PRINCIPAL', 'TEACHER', 'STUDENT'), getStudentAcademics);
