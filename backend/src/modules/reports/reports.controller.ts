import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    // Aggregate some basic stats for reports
    const studentCount = await prisma.student.count({ where: { schoolId } });
    const teacherCount = await prisma.teacher.count({ where: { schoolId } });
    const classCount = await prisma.class.count({ where: { schoolId } });
    const warningCount = await prisma.earlyWarningFlag.count({ where: { schoolId, isResolved: false } });

    res.json({
      success: true,
      data: { studentCount, teacherCount, classCount, warningCount }
    });
  } catch (error) {
    next(error);
  }
}
