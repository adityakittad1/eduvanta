import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function getNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const role = req.user?.role;
    
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    let where: any = { schoolId };

    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user?.id } });
      if (!student) {
        res.json({ success: true, data: [] });
        return;
      }
      where.status = 'PUBLISHED';
      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: 'STUDENTS' },
        { targetAudience: 'CLASS', targetClassId: student.classId }
      ];
    } else if (role === 'TEACHER') {
      where.status = 'PUBLISHED';
      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: 'TEACHERS' },
        { targetAudience: 'CLASS' } // Teachers can see all class notices for now
      ];
    }

    const notices = await prisma.notice.findMany({
      where,
      include: {
        createdBy: { select: { email: true } },
        targetClass: { select: { name: true, division: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;

    const notice = await prisma.notice.create({
      data: {
        schoolId,
        title: data.title,
        content: data.content,
        targetAudience: data.targetAudience,
        targetClassId: data.targetClassId || null,
        status: 'PUBLISHED',
        visibility: data.visibility === 'PUBLIC' ? 'PUBLIC' : 'INTERNAL',
        publishedAt: new Date(),
        createdByUserId: req.user!.id
      },
      include: {
        targetClass: { select: { name: true, division: true } }
      }
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
}
