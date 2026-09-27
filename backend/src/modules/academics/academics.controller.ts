import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateAssessmentInput, SaveMarksInput } from './academics.schema';

export async function createAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body as CreateAssessmentInput;

    const assessment = await prisma.assessment.create({
      data: {
        schoolId,
        classId: data.classId,
        subjectId: data.subjectId,
        name: data.name,
        type: data.type,
        maxMarks: data.maxMarks,
        conductedDate: data.conductedDate ? new Date(data.conductedDate) : null,
        academicYear: data.academicYear
      }
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
}

export async function getAssessments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.query.classId as string;
    const subjectId = req.query.subjectId as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const assessments = await prisma.assessment.findMany({
      where: {
        schoolId,
        ...(classId && { classId }),
        ...(subjectId && { subjectId })
      },
      include: {
        class: { select: { name: true, division: true } },
        subject: { select: { name: true } },
        _count: { select: { academicRecords: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const assessmentId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        class: { select: { name: true, division: true } },
        subject: { select: { name: true } }
      }
    });
    if (!assessment || assessment.schoolId !== schoolId) {
      throw new AppError('Assessment not found', 404, 'NOT_FOUND');
    }



    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
}

export async function saveMarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const assessmentId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { records } = req.body as SaveMarksInput;

    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment || assessment.schoolId !== schoolId) {
      throw new AppError('Assessment not found', 404, 'NOT_FOUND');
    }


    const upserts = records.map(record => {
      // Basic validation
      if (record.marksObtained > assessment.maxMarks) {
        throw new AppError(`Marks obtained cannot exceed max marks for student ${record.studentId}`, 400, 'BAD_REQUEST');
      }

      return prisma.academicRecord.upsert({
        where: {
          studentId_assessmentId: {
            studentId: record.studentId,
            assessmentId: assessmentId
          }
        },
        update: {
          marksObtained: record.marksObtained,
          remarks: record.remarks || null
        },
        create: {
          schoolId,
          studentId: record.studentId,
          assessmentId: assessmentId,
          marksObtained: record.marksObtained,
          remarks: record.remarks || null
        }
      });
    });

    await prisma.$transaction(upserts);

    res.json({ success: true, message: `Successfully saved marks for ${records.length} students` });
  } catch (error) {
    next(error);
  }
}

export async function getMarksForAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const assessmentId = req.params.id as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const marks = await prisma.academicRecord.findMany({
      where: {
        schoolId,
        assessmentId
      }
    });

    res.json({ success: true, data: marks });
  } catch (error) {
    next(error);
  }
}

export async function getStudentAcademics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const studentId = req.params.studentId as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (student?.userId !== req.user.id) {
        throw new AppError('Forbidden', 403, 'FORBIDDEN');
      }
    }

    const records = await prisma.academicRecord.findMany({
      where: { schoolId, studentId },
      include: {
        assessment: {
          include: { subject: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    records.forEach(r => {
      totalMarksObtained += r.marksObtained;
      totalMaxMarks += r.assessment.maxMarks;
    });

    const averagePercentage = totalMaxMarks > 0 
      ? Math.round((totalMarksObtained / totalMaxMarks) * 100) 
      : null;

    res.json({
      success: true,
      data: {
        averagePercentage,
        records
      }
    });
  } catch (error) {
    next(error);
  }
}
