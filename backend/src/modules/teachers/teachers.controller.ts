import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateTeacherInput, UpdateTeacherInput } from './teachers.schema';

export async function getTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where: { schoolId },
        include: {
          user: { select: { email: true, isActive: true } }
        },
        skip,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.teacher.count({ where: { schoolId } }),
    ]);

    res.json({
      success: true,
      data: teachers,
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

export async function getTeacherById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const teacherId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { email: true, isActive: true } },
        teacherClassSubjects: {
          include: {
            class: true,
            subject: true
          }
        }
      }
    });

    if (!teacher || teacher.schoolId !== schoolId) {
      throw new AppError('Teacher not found', 404, 'NOT_FOUND');
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
}

export async function createTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // SECURITY: schoolId ALWAYS comes from authenticated user — never trusted from client body
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as CreateTeacherInput;

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');
    const schoolSlug = school.slug ? school.slug.replace(/-/g, '').toLowerCase() : 'school';

    let emailToUse = data.email?.trim() || '';
    if (!emailToUse) {
      const cleanFirstName = data.firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanLastName = data.lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const baseEmail = `teacher.${cleanFirstName}.${cleanLastName}`;
      let suffix = 1;
      let isUnique = false;
      while (!isUnique) {
        const suffixStr = suffix === 1 ? '' : String(suffix);
        emailToUse = `${baseEmail}${suffixStr}@${schoolSlug}.eduvanta.teacher`;
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

    // Default password: Teacher@123 — principal should communicate this to the teacher
    const passwordHash = await bcrypt.hash('Teacher@123', 10);
    
    // Create User and Teacher inside a transaction to ensure atomicity
    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailToUse,
          name: `${data.firstName} ${data.lastName}`.trim(), // Store display name
          passwordHash,
          role: 'TEACHER',
          schoolId,  // ALWAYS from authenticated context
        }
      });

      return tx.teacher.create({
        data: {
          schoolId,  // ALWAYS from authenticated context
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          employeeId: data.employeeId || null,
          qualification: data.qualification || null,
        },
        include: {
          user: { select: { email: true, name: true } }
        }
      });
    });

    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
}

export async function updateTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const teacherId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as UpdateTeacherInput;

    const existingTeacher = await prisma.teacher.findUnique({ 
      where: { id: teacherId },
      include: { user: true }
    });
    
    if (!existingTeacher || existingTeacher.schoolId !== schoolId) {
      throw new AppError('Teacher not found', 404, 'NOT_FOUND');
    }

    const teacher = await prisma.$transaction(async (tx) => {
      // If active status changed, sync it with the User table
      if (data.isActive !== undefined && data.isActive !== existingTeacher.isActive) {
        await tx.user.update({
          where: { id: existingTeacher.userId },
          data: { isActive: data.isActive }
        });
      }

      return tx.teacher.update({
        where: { id: teacherId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          employeeId: data.employeeId || null,
          qualification: data.qualification || null,
          isActive: data.isActive,
        },
        include: {
          user: { select: { email: true, isActive: true } }
        }
      });
    });

    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
}
