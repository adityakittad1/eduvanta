import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function getTcs(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      where.studentId = student.id;
    }

    const tcs = await prisma.transferCertificate.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true, division: true } } } },
        approvedBy: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: tcs });
  } catch (error) {
    next(error);
  }
}

export async function requestTc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;
    let studentId = '';

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) throw new AppError('Student profile not found', 404, 'NOT_FOUND');
      studentId = student.id;
    } else {
      // Principal/Teacher requesting on behalf of student
      studentId = data.studentId;
    }

    if (!studentId) throw new AppError('Student ID is required', 400, 'BAD_REQUEST');

    // Generate unique TC number (simplified)
    const tcCount = await prisma.transferCertificate.count({ where: { schoolId } });
    const tcNumber = `TC-${new Date().getFullYear()}-${String(tcCount + 1).padStart(4, '0')}`;

    const tc = await prisma.transferCertificate.create({
      data: {
        schoolId,
        studentId,
        tcNumber,
        reason: data.reason || null,
        status: 'REQUESTED'
      }
    });

    res.status(201).json({ success: true, data: tc });
  } catch (error) {
    next(error);
  }
}

export async function updateTcStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const tcId = req.params.id as string;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;
    
    let updateData: any = { status: data.status };
    if (data.status === 'APPROVED') {
      updateData.approvedDate = new Date();
      updateData.approvedByUserId = req.user!.id;
    } else if (data.status === 'ISSUED') {
      updateData.issuedDate = new Date();
      if (data.fileUrl) updateData.fileUrl = data.fileUrl;
      
      // Mark student as inactive if TC is issued
      const tc = await prisma.transferCertificate.findUnique({ where: { id: tcId } });
      if (tc) {
        await prisma.student.update({
          where: { id: tc.studentId },
          data: { isActive: false }
        });
      }
    }

    const updatedTc = await prisma.transferCertificate.update({
      where: { id: tcId, schoolId },
      data: updateData
    });

    res.json({ success: true, data: updatedTc });
  } catch (error) {
    next(error);
  }
}
