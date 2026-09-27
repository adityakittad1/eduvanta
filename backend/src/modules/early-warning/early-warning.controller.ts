import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { evaluateAllStudents } from './early-warning.service';
import { EvaluateRequestInput } from './early-warning.schema';

export async function getFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const classId = req.query.classId as string;

    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const flags = await prisma.earlyWarningFlag.findMany({
      where: {
        schoolId,
        isResolved: false,
        ...(classId && { student: { classId } })
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            class: { select: { name: true, division: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: flags });
  } catch (error) {
    next(error);
  }
}

export async function runEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { classId } = req.body as EvaluateRequestInput;

    const evaluatedCount = await evaluateAllStudents(schoolId, classId);

    res.json({ 
      success: true, 
      message: `Successfully evaluated ${evaluatedCount} students.`,
      data: { evaluatedCount }
    });
  } catch (error) {
    next(error);
  }
}
