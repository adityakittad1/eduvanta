import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/errorHandler';
import { CreateStudentInput, UpdateStudentInput } from './students.schema';
import {
  dbGetStudents,
  dbGetStudentById,
  dbFindStudentByAdmission,
  dbGetSchoolById,
  dbFindUserByEmail,
  dbCreateUser,
  dbCreateStudent,
  dbUpdateStudent,
} from '../../lib/dataDb';

export async function getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const classId = req.query.classId as string | undefined;

    const { students, total } = await dbGetStudents({
      schoolId,
      classId,
      skip,
      take: limit,
    });

    res.json({
      success: true,
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const studentId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const student = await dbGetStudentById(studentId, schoolId);

    if (!student) {
      throw new AppError('Student not found', 404, 'NOT_FOUND');
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // SECURITY: schoolId ALWAYS comes from authenticated user — never trusted from client body
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as CreateStudentInput;

    // Check if admission number already exists in this school
    const existingStudent = await dbFindStudentByAdmission(schoolId, data.admissionNumber);
    if (existingStudent) {
      throw new AppError('Admission number already in use at this school', 400, 'BAD_REQUEST');
    }

    const school = await dbGetSchoolById(schoolId);
    if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');
    const schoolSlug = school.slug ? school.slug.replace(/-/g, '').toLowerCase() : 'school';

    // Auto-provision user account if email is provided, else generate one
    let emailToUse = data.email?.trim() || '';
    if (!emailToUse) {
      const cleanFirstName = data.firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanLastName = data.lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const baseEmail = `${cleanFirstName}.${cleanLastName}.${schoolSlug}`;
      let suffix = 1;
      let isUnique = false;
      while (!isUnique) {
        const suffixStr = String(suffix).padStart(3, '0');
        emailToUse = `${baseEmail}${suffixStr}@eduvanta.student`;
        const exists = await dbFindUserByEmail(emailToUse);
        if (!exists) {
          isUnique = true;
        } else {
          suffix++;
        }
      }
    } else {
      const existingUser = await dbFindUserByEmail(emailToUse);
      if (existingUser) {
        throw new AppError('This email is already associated with another account', 400, 'DUPLICATE_EMAIL');
      }
    }

    // Default password: Student@123 — must be changed on first login (future enforcement)
    const passwordHash = await bcrypt.hash('Student@123', 10);
    const user = await dbCreateUser({
      email: emailToUse,
      name: `${data.firstName} ${data.lastName}`.trim(), // Store display name
      passwordHash,
      role: 'STUDENT',
      schoolId,  // ALWAYS the authenticated school — never from client
    });

    const student = await dbCreateStudent({
      schoolId,  // ALWAYS from authenticated context
      userId: user.id,
      admissionNumber: data.admissionNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender,
      address: data.address || null,
      guardianName: data.guardianName || null,
      guardianPhone: data.guardianPhone || null,
      academicYear: data.academicYear,
      classId: data.classId || null,
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const studentId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as UpdateStudentInput;

    const existingStudent = await dbGetStudentById(studentId, schoolId);
    if (!existingStudent) {
      throw new AppError('Student not found', 404, 'NOT_FOUND');
    }

    const student = await dbUpdateStudent(studentId, schoolId, data);
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}

