import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateSchoolInput, UpdateSchoolInput } from './schools.schema';
import { logger } from '../../lib/logger';

// ─── Slug generation ─────────────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces → dashes
    .replace(/-+/g, '-')             // collapse dashes
    .substring(0, 60);               // max length
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = generateSlug(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.school.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function getAllSchools(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? { name: { contains: search as string, mode: 'insensitive' as const } }
      : {};

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { students: true, teachers: true }
          }
        }
      }),
      prisma.school.count({ where }),
    ]);

    res.json({
      success: true,
      data: schools,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSchoolById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
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

export async function createSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateSchoolInput;

    // Auto-generate a unique slug from the school name
    const slug = await generateUniqueSlug(data.name);

    const school = await prisma.school.create({
      data: {
        ...data,
        slug,
        contactEmail: data.contactEmail || null,
        logoUrl: data.logoUrl || null,
      },
    });

    logger.info(`School created: ${school.id} (slug: ${slug})`, { userId: req.user?.id });

    // Audit log — school onboarding is critical
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SCHOOL_CREATED',
        entityType: 'School',
        entityId: school.id,
        details: { name: school.name, slug },
      }
    });

    res.status(201).json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
}

export async function updateSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = req.body as UpdateSchoolInput;

    const existing = await prisma.school.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('School not found', 404, 'NOT_FOUND');
    }

    const school = await prisma.school.update({
      where: { id },
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
