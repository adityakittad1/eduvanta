import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateStudentInput, UpdateStudentInput } from './students.schema';

export async function getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const classId = req.query.classId as string | undefined;

    const where = {
      schoolId,
      ...(classId === 'null' ? { classId: null } : classId ? { classId } : {}),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: true,
          user: { select: { email: true, isActive: true } }
        },
        skip,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      success: true,
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        user: { select: { email: true, isActive: true } },
        earlyWarningFlags: {
          where: { isResolved: false }
        },
        // In future phases: attendanceRecords, academicRecords, quizAttempts will be joined or fetched via specialized routes
      }
    });

    if (!student || student.schoolId !== schoolId) {
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
    const existingStudent = await prisma.student.findUnique({
      where: { schoolId_admissionNumber: { schoolId, admissionNumber: data.admissionNumber } }
    });
    if (existingStudent) {
      throw new AppError('Admission number already in use at this school', 400, 'BAD_REQUEST');
    }

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');
    const schoolSlug = school.slug ? school.slug.replace(/-/g, '').toLowerCase() : 'school';

    // Auto-provision user account if email is provided, else generate one
    let emailToUse = data.email?.trim() || '';
    if (!emailToUse) {
      const baseEmail = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}.${schoolSlug}`;
      let suffix = 1;
      let isUnique = false;
      while (!isUnique) {
        emailToUse = `${baseEmail}${suffix}@gmail.com`;
        const exists = await prisma.user.findUnique({ where: { email: emailToUse } });
        if (!exists) {
          isUnique = true;
        } else {
          suffix++;
        }
      }
    } else {
      const existingUser = await prisma.user.findUnique({ where: { email: emailToUse } });
      if (existingUser) {
        throw new AppError('This email is already associated with another account', 400, 'DUPLICATE_EMAIL');
      }
    }

    // Default password: Student@123 — must be changed on first login (future enforcement)
    const passwordHash = await bcrypt.hash('Student@123', 10);
    const user = await prisma.user.create({
      data: {
        email: emailToUse,
        name: `${data.firstName} ${data.lastName}`.trim(), // Store display name
        passwordHash,
        role: 'STUDENT',
        schoolId,  // ALWAYS the authenticated school — never from client
      }
    });

    const student = await prisma.student.create({
      data: {
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
      },
      include: {
        user: { select: { email: true } },
        class: true
      }
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

    const existingStudent = await prisma.student.findUnique({ where: { id: studentId } });
    if (!existingStudent || existingStudent.schoolId !== schoolId) {
      throw new AppError('Student not found', 404, 'NOT_FOUND');
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        classId: data.classId === '' ? null : data.classId,
      },
      include: {
        user: { select: { email: true } },
        class: true
      }
    });

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}
