import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

// ─── School Profile ───────────────────────────────────────────

export async function getSchoolProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const profile = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        facilities: true,
        achievements: true,
        events: {
          orderBy: { eventDate: 'asc' },
          take: 20,
        },
        _count: {
          select: {
            students: { where: { isActive: true } },
            teachers: { where: { isActive: true } },
            classes: { where: { isActive: true } },
          },
        },
      },
    });

    if (!profile) throw new AppError('School not found', 404, 'NOT_FOUND');

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateSchoolProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const {
      name, description, tagline, address, contactPhone, contactEmail,
      principalName, logoUrl, establishedYear, isPublicEnabled,
    } = req.body;

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(tagline !== undefined && { tagline }),
        ...(address !== undefined && { address }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(principalName !== undefined && { principalName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(establishedYear !== undefined && { establishedYear: establishedYear ? Number(establishedYear) : null }),
        ...(isPublicEnabled !== undefined && { isPublicEnabled: Boolean(isPublicEnabled) }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// ─── Facilities ───────────────────────────────────────────────

export async function getFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const facilities = await prisma.schoolFacility.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: facilities });
  } catch (error) {
    next(error);
  }
}

export async function createFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { name, description, icon } = req.body;
    if (!name?.trim()) throw new AppError('Facility name is required', 400, 'BAD_REQUEST');

    const facility = await prisma.schoolFacility.create({
      data: { schoolId, name: name.trim(), description: description || null, icon: icon || null },
    });

    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
}

export async function deleteFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;
    const facility = await prisma.schoolFacility.findUnique({ where: { id } });
    if (!facility || facility.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');

    await prisma.schoolFacility.delete({ where: { id } });
    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
}

// ─── Achievements ─────────────────────────────────────────────

export async function getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const achievements = await prisma.schoolAchievement.findMany({
      where: { schoolId },
      orderBy: [{ year: 'desc' }, { title: 'asc' }],
    });

    res.json({ success: true, data: achievements });
  } catch (error) {
    next(error);
  }
}

export async function createAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { title, description, year } = req.body;
    if (!title?.trim()) throw new AppError('Achievement title is required', 400, 'BAD_REQUEST');

    const achievement = await prisma.schoolAchievement.create({
      data: {
        schoolId,
        title: title.trim(),
        description: description || null,
        year: year ? Number(year) : null,
      },
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    next(error);
  }
}

export async function deleteAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;
    const achievement = await prisma.schoolAchievement.findUnique({ where: { id } });
    if (!achievement || achievement.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');

    await prisma.schoolAchievement.delete({ where: { id } });
    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
}

// ─── Events ───────────────────────────────────────────────────

export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const events = await prisma.schoolEvent.findMany({
      where: { schoolId },
      orderBy: { eventDate: 'asc' },
    });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { title, description, eventDate, isPublic } = req.body;
    if (!title?.trim()) throw new AppError('Event title is required', 400, 'BAD_REQUEST');
    if (!eventDate) throw new AppError('Event date is required', 400, 'BAD_REQUEST');

    const event = await prisma.schoolEvent.create({
      data: {
        schoolId,
        title: title.trim(),
        description: description || null,
        eventDate: new Date(eventDate),
        isPublic: isPublic !== false,
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;
    const existing = await prisma.schoolEvent.findUnique({ where: { id } });
    if (!existing || existing.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');

    const { title, description, eventDate, isPublic } = req.body;

    const updated = await prisma.schoolEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;
    const event = await prisma.schoolEvent.findUnique({ where: { id } });
    if (!event || event.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');

    await prisma.schoolEvent.delete({ where: { id } });
    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
}
