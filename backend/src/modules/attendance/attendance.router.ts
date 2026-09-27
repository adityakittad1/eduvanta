import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../auth/auth.controller';
import { validateRequest } from '../../middleware/validate';
import { markAttendanceSchema } from './attendance.schema';
import { markAttendance, getDailyAttendance, getStudentAttendance } from './attendance.controller';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate, requireSchool);

// Principals and Teachers can mark and view daily class attendance
attendanceRouter.post('/', requireRole('PRINCIPAL', 'TEACHER'), validateRequest(markAttendanceSchema), markAttendance);
attendanceRouter.get('/', requireRole('PRINCIPAL', 'TEACHER'), getDailyAttendance);

// Everyone (including student themselves) can view a specific student's attendance history
attendanceRouter.get('/student/:studentId', requireRole('PRINCIPAL', 'TEACHER', 'STUDENT'), getStudentAttendance);
