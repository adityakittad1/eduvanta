import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { generateCuid } from '../../lib/dataDb';
import { AppError } from '../../middleware/errorHandler';

export async function getGalleryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const items = await prisma.galleryItem.findMany({
          where: { schoolId },
          include: {
            uploadedBy: { select: { email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: items });
        return;
      } catch {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: items, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw new AppError('Failed to fetch gallery items: ' + error.message, 500, 'INTERNAL_ERROR');

      const mapped = (items || []).map(item => ({
        id: item.id,
        schoolId: item.school_id,
        title: item.title,
        description: item.description,
        category: item.category,
        fileUrl: item.file_url,
        isPublic: item.is_public,
        uploadedByUserId: item.uploaded_by_user_id,
        createdAt: item.created_at,
        uploadedBy: { email: 'admin@school.eduvanta' }
      }));

      res.json({ success: true, data: mapped });
      return;
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
}

export async function uploadGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;

    if (isPrismaAvailable()) {
      try {
        const item = await prisma.galleryItem.create({
          data: {
            schoolId,
            title: data.title,
            description: data.description || null,
            category: data.category,
            fileUrl: data.fileUrl,
            isPublic: Boolean(data.isPublic) || false,
            uploadedByUserId: req.user!.id
          }
        });

        res.status(201).json({ success: true, data: item });
        return;
      } catch {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const itemId = generateCuid();
      const nowIso = new Date().toISOString();
      const { data: item, error } = await supabase
        .from('gallery_items')
        .insert({
          id: itemId,
          school_id: schoolId,
          title: data.title,
          description: data.description || null,
          category: data.category,
          file_url: data.fileUrl,
          is_public: Boolean(data.isPublic) || false,
          uploaded_by_user_id: req.user!.id,
          created_at: nowIso
        })
        .select()
        .single();

      if (error) throw new AppError('Failed to save gallery item: ' + error.message, 500, 'INTERNAL_ERROR');

      res.status(201).json({
        success: true,
        data: {
          id: item.id,
          schoolId: item.school_id,
          title: item.title,
          description: item.description,
          category: item.category,
          fileUrl: item.file_url,
          isPublic: item.is_public,
          uploadedByUserId: item.uploaded_by_user_id,
          createdAt: item.created_at,
          uploadedBy: { email: req.user!.email }
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

// PATCH /gallery/:id: update isPublic flag (and optionally other fields)
export async function updateGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;
    const { isPublic } = req.body;

    if (isPrismaAvailable()) {
      try {
        const existing = await prisma.galleryItem.findUnique({ where: { id } });
        if (!existing || existing.schoolId !== schoolId) {
          throw new AppError('Gallery item not found', 404, 'NOT_FOUND');
        }

        const updated = await prisma.galleryItem.update({
          where: { id },
          data: {
            ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
          }
        });

        res.json({ success: true, data: updated });
        return;
      } catch (err) {
        if (err instanceof AppError) throw err;
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data: updated, error } = await supabase
        .from('gallery_items')
        .update({
          ...(isPublic !== undefined && { is_public: Boolean(isPublic) })
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw new AppError('Failed to update gallery item: ' + error.message, 500, 'INTERNAL_ERROR');
      if (!updated) throw new AppError('Gallery item not found', 404, 'NOT_FOUND');

      res.json({
        success: true,
        data: {
          id: updated.id,
          schoolId: updated.school_id,
          title: updated.title,
          description: updated.description,
          category: updated.category,
          fileUrl: updated.file_url,
          isPublic: updated.is_public,
          uploadedByUserId: updated.uploaded_by_user_id,
          createdAt: updated.created_at
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}
