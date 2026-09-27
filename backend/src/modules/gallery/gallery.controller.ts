import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function getGalleryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const items = await prisma.galleryItem.findMany({
      where: { schoolId },
      include: {
        uploadedBy: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function uploadGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const data = req.body;

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
  } catch (error) {
    next(error);
  }
}

// PATCH /gallery/:id — update isPublic flag (and optionally other fields)
export async function updateGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;

    // Verify ownership — gallery item must belong to this school
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing || existing.schoolId !== schoolId) {
      throw new AppError('Gallery item not found', 404, 'NOT_FOUND');
    }

    const { isPublic } = req.body;

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: {
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
