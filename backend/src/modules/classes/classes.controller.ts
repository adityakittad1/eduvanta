import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateClassInput, CreateSubjectInput, AssignTeacherInput, AssignStudentsInput } from './classes.schema';

export async function getClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { students: true, subjects: true }
        }
      },
      orderBy: [
        { name: 'asc' },
        { division: 'asc' }
      ],
    });

    res.json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
}

export async function getClassById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          orderBy: { firstName: 'asc' }
        },
        subjects: {
          include: {
            teacherClassSubjects: {
              include: {
                teacher: true
              }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!classRecord || classRecord.schoolId !== schoolId) {
      throw new AppError('Class not found', 404, 'NOT_FOUND');
    }

    res.json({ success: true, data: classRecord });
  } catch (error) {
    next(error);
  }
}

export async function createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as CreateClassInput;

    const existingClass = await prisma.class.findFirst({
      where: {
        schoolId,
        name: data.name,
        division: data.division || null,
        academicYear: data.academicYear
      }
    });

    if (existingClass) {
      throw new AppError('This class/division already exists for this academic year', 400, 'BAD_REQUEST');
    }

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name: data.name,
        division: data.division || null,
        academicYear: data.academicYear,
      }
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    next(error);
  }
}

export async function createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as CreateSubjectInput;

    // Verify class exists
    const classRecord = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRecord || classRecord.schoolId !== schoolId) {
      throw new AppError('Class not found', 404, 'NOT_FOUND');
    }

    const existingSubject = await prisma.subject.findFirst({
      where: { schoolId, classId, name: data.name }
    });

    if (existingSubject) {
      throw new AppError('Subject with this name already exists in this class', 400, 'BAD_REQUEST');
    }

    const subject = await prisma.subject.create({
      data: {
        schoolId,
        classId,
        name: data.name,
        code: data.code || null,
      }
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
}

export async function assignTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as AssignTeacherInput;

    // Check if mapping already exists, if so update it, else create
    const existingMapping = await prisma.teacherClassSubject.findFirst({
      where: {
        schoolId,
        classId,
        subjectId: data.subjectId,
        academicYear: data.academicYear
      }
    });

    let assignment;
    if (existingMapping) {
      // Update the assigned teacher
      assignment = await prisma.teacherClassSubject.update({
        where: { id: existingMapping.id },
        data: { teacherId: data.teacherId }
      });
    } else {
      assignment = await prisma.teacherClassSubject.create({
        data: {
          schoolId,
          classId,
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          academicYear: data.academicYear
        }
      });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
}

export async function assignStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as AssignStudentsInput;

    // Verify class exists
    const classRecord = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRecord || classRecord.schoolId !== schoolId) {
      throw new AppError('Class not found', 404, 'NOT_FOUND');
    }

    // Update students in bulk
    const updateResult = await prisma.student.updateMany({
      where: {
        id: { in: data.studentIds },
        schoolId // Security check
      },
      data: {
        classId
      }
    });

    res.json({ success: true, message: `Successfully assigned ${updateResult.count} students to this class.` });
  } catch (error) {
    next(error);
  }
}
