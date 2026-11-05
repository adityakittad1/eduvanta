import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { generateCuid } from '../../lib/dataDb';
import { AppError } from '../../middleware/errorHandler';

export async function getNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const role = req.user?.role;
    
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    let where: any = { schoolId };

    if (isPrismaAvailable()) {
      try {
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
            { targetAudience: 'CLASS' }
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
        return;
      } catch {
        markPrismaFailure();
      }
    }

    // Fallback via Supabase
    if (supabase) {
      let query = supabase.from('notices').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
      if (role === 'STUDENT' || role === 'TEACHER') {
        query = query.eq('status', 'PUBLISHED');
      }
      const { data, error } = await query;
      if (error) throw new AppError('Failed to retrieve notices', 500, 'INTERNAL_ERROR');

      const mapped = (data || []).map((n: any) => ({
        id: n.id,
        schoolId: n.school_id,
        title: n.title,
        content: n.content,
        targetAudience: n.target_audience,
        targetClassId: n.target_class_id,
        status: n.status,
        visibility: n.visibility,
        publishedAt: n.published_at,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
        createdBy: { email: 'faculty@school.in' },
        targetClass: null
      }));

      res.json({ success: true, data: mapped });
      return;
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;

    if (isPrismaAvailable()) {
      try {
        const notice = await prisma.notice.create({
          data: {
            schoolId,
            title: data.title,
            content: data.content,
            targetAudience: data.targetAudience,
            targetClassId: data.targetClassId || null,
            status: data.status || 'PUBLISHED',
            visibility: data.visibility === 'PUBLIC' ? 'PUBLIC' : 'INTERNAL',
            publishedAt: new Date(),
            createdByUserId: req.user!.id
          },
          include: {
            targetClass: { select: { name: true, division: true } }
          }
        });

        res.status(201).json({ success: true, data: notice });
        return;
      } catch {
        markPrismaFailure();
      }
    }

    // Fallback via Supabase
    if (supabase) {
      const noticeId = generateCuid();
      const nowIso = new Date().toISOString();
      const { data: newNotice, error } = await supabase.from('notices').insert({
        id: noticeId,
        school_id: schoolId,
        title: data.title,
        content: data.content,
        target_audience: data.targetAudience,
        target_class_id: data.targetClassId || null,
        status: data.status || 'PUBLISHED',
        visibility: data.visibility === 'PUBLIC' ? 'PUBLIC' : 'INTERNAL',
        created_by_user_id: req.user!.id,
        published_at: nowIso,
        created_at: nowIso,
        updated_at: nowIso
      }).select().single();

      if (error) throw new AppError('Failed to publish notice: ' + error.message, 500, 'INTERNAL_ERROR');

      res.status(201).json({
        success: true,
        data: {
          id: newNotice.id,
          schoolId: newNotice.school_id,
          title: newNotice.title,
          content: newNotice.content,
          targetAudience: newNotice.target_audience,
          targetClassId: newNotice.target_class_id,
          status: newNotice.status,
          visibility: newNotice.visibility,
          publishedAt: newNotice.published_at,
          createdAt: newNotice.created_at,
          targetClass: null
        }
      });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const id = req.params.id as string;
    
    if (isPrismaAvailable()) {
      try {
        const existing = await prisma.notice.findFirst({ where: { id, schoolId } });
        if (!existing) {
          throw new AppError('Notice not found', 404, 'NOT_FOUND');
        }
        await prisma.notice.delete({ where: { id } });
        res.json({ success: true, message: 'Notice deleted successfully' });
        return;
      } catch (err) {
        if (err instanceof AppError) throw err;
        markPrismaFailure();
      }
    }

    if (supabase) {
      await supabase.from('notices').delete().eq('id', id).eq('school_id', schoolId);
      res.json({ success: true, message: 'Notice deleted successfully' });
      return;
    }

    throw new AppError('Database connection unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

