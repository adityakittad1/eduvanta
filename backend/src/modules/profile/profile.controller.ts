import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { UpdateSchoolProfileInput, AddFacilityInput, AddAchievementInput } from './profile.schema';

export async function getMySchoolProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) {
      throw new AppError('No school associated with this user', 400, 'BAD_REQUEST');
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        facilities: true,
        achievements: {
          orderBy: { year: 'desc' }
        },
        _count: {
          select: { students: true, teachers: true }
        }
      }
    });

    if (!school) {
      throw new AppError('School not found', 404, 'NOT_FOUND');
    }

    res.json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
}

export async function updateMySchoolProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) {
      throw new AppError('No school associated with this user', 400, 'BAD_REQUEST');
    }

    const data = req.body as UpdateSchoolProfileInput;

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...data,
        contactEmail: data.contactEmail === '' ? null : data.contactEmail,
        logoUrl: data.logoUrl === '' ? null : data.logoUrl,
      },
    });

    res.json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
}

export async function addFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school associated', 400, 'BAD_REQUEST');

    const data = req.body as AddFacilityInput;

    const facility = await prisma.schoolFacility.create({
      data: {
        schoolId,
        name: data.name,
        description: data.description || null,
      }
    });

    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
}

export async function removeFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const facilityId = req.params.id as string;
    
    if (!schoolId) throw new AppError('No school associated', 400, 'BAD_REQUEST');

    // Ensure facility belongs to school
    const facility = await prisma.schoolFacility.findUnique({ where: { id: facilityId } });
    if (!facility || facility.schoolId !== schoolId) {
      throw new AppError('Facility not found or not owned by this school', 404, 'NOT_FOUND');
    }

    await prisma.schoolFacility.delete({ where: { id: facilityId } });
    res.json({ success: true, message: 'Facility removed' });
  } catch (error) {
    next(error);
  }
}

export async function addAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school associated', 400, 'BAD_REQUEST');

    const data = req.body as AddAchievementInput;

    const achievement = await prisma.schoolAchievement.create({
      data: {
        schoolId,
        title: data.title,
        description: data.description || null,
        year: data.year || null,
      }
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    next(error);
  }
}

export async function removeAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    const achievementId = req.params.id as string;
    
    if (!schoolId) throw new AppError('No school associated', 400, 'BAD_REQUEST');

    const achievement = await prisma.schoolAchievement.findUnique({ where: { id: achievementId } });
    if (!achievement || achievement.schoolId !== schoolId) {
      throw new AppError('Achievement not found or not owned by this school', 404, 'NOT_FOUND');
    }

    await prisma.schoolAchievement.delete({ where: { id: achievementId } });
    res.json({ success: true, message: 'Achievement removed' });
  } catch (error) {
    next(error);
  }
}
