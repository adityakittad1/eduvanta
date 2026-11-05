/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { isPrismaAvailable, markPrismaFailure } from '../../lib/authDb';
import { generateCuid } from '../../lib/dataDb';
import { AppError } from '../../middleware/errorHandler';

// ─── School Profile ───────────────────────────────────────────

export async function getSchoolProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    // 1. Try Prisma first if healthy
    if (isPrismaAvailable()) {
      try {
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

        if (profile) {
          res.json({ success: true, data: profile });
          return;
        }
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    // 2. Serverless Supabase Fallback
    if (supabase) {
      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .maybeSingle();

      if (!school) throw new AppError('School not found', 404, 'NOT_FOUND');

      const [
        { data: facilities },
        { data: achievements },
        { data: events },
        { count: studentCount },
        { count: teacherCount },
        { count: classCount },
      ] = await Promise.all([
        supabase.from('school_facilities').select('*').eq('school_id', schoolId).order('name', { ascending: true }),
        supabase.from('school_achievements').select('*').eq('school_id', schoolId).order('year', { ascending: false }),
        supabase.from('school_events').select('*').eq('school_id', schoolId).order('event_date', { ascending: true }).limit(20),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
      ]);

      const mappedSchool = {
        id: school.id,
        name: school.name,
        slug: school.slug,
        logoUrl: school.logo_url,
        address: school.address,
        contactPhone: school.contact_phone,
        contactEmail: school.contact_email,
        principalName: school.principal_name,
        description: school.description,
        tagline: school.tagline,
        establishedYear: school.established_year,
        isActive: school.is_active ?? true,
        isPublicEnabled: school.is_public_enabled ?? true,
        facilities: (facilities || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          icon: f.icon,
        })),
        achievements: (achievements || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          year: a.year,
        })),
        events: (events || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          eventDate: e.event_date,
          isPublic: e.is_public,
        })),
        _count: {
          students: studentCount || 0,
          teachers: teacherCount || 0,
          classes: classCount || 0,
        },
      };

      res.json({ success: true, data: mappedSchool });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
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

    if (isPrismaAvailable()) {
      try {
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
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;
      if (tagline !== undefined) payload.tagline = tagline;
      if (address !== undefined) payload.address = address;
      if (contactPhone !== undefined) payload.contact_phone = contactPhone;
      if (contactEmail !== undefined) payload.contact_email = contactEmail;
      if (principalName !== undefined) payload.principal_name = principalName;
      if (logoUrl !== undefined) payload.logo_url = logoUrl;
      if (establishedYear !== undefined) payload.established_year = establishedYear ? Number(establishedYear) : null;
      if (isPublicEnabled !== undefined) payload.is_public_enabled = Boolean(isPublicEnabled);

      const { data, error } = await supabase
        .from('schools')
        .update(payload)
        .eq('id', schoolId)
        .select()
        .single();

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');

      res.json({
        success: true,
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          logoUrl: data.logo_url,
          address: data.address,
          contactPhone: data.contact_phone,
          contactEmail: data.contact_email,
          principalName: data.principal_name,
          description: data.description,
          tagline: data.tagline,
          establishedYear: data.established_year,
          isPublicEnabled: data.is_public_enabled,
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

// ─── Facilities ───────────────────────────────────────────────

export async function getFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const facilities = await prisma.schoolFacility.findMany({
          where: { schoolId },
          orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: facilities });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('school_facilities')
        .select('*')
        .eq('school_id', schoolId)
        .order('name', { ascending: true });

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({
        success: true,
        data: (data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          icon: f.icon,
        }))
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
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

    if (isPrismaAvailable()) {
      try {
        const facility = await prisma.schoolFacility.create({
          data: { schoolId, name: name.trim(), description: description || null, icon: icon || null },
        });
        res.status(201).json({ success: true, data: facility });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const facilityId = generateCuid();
      const { data, error } = await supabase
        .from('school_facilities')
        .insert({
          id: facilityId,
          school_id: schoolId,
          name: name.trim(),
          description: description || null,
          icon: icon || null,
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.status(201).json({
        success: true,
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          icon: data.icon,
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function deleteFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;

    if (isPrismaAvailable()) {
      try {
        const facility = await prisma.schoolFacility.findUnique({ where: { id } });
        if (!facility || facility.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');
        await prisma.schoolFacility.delete({ where: { id } });
        res.json({ success: true, data: { id } });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { error } = await supabase
        .from('school_facilities')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({ success: true, data: { id } });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

// ─── Achievements ─────────────────────────────────────────────

export async function getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const achievements = await prisma.schoolAchievement.findMany({
          where: { schoolId },
          orderBy: [{ year: 'desc' }, { title: 'asc' }],
        });
        res.json({ success: true, data: achievements });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('school_achievements')
        .select('*')
        .eq('school_id', schoolId)
        .order('year', { ascending: false });

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({
        success: true,
        data: (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          year: a.year,
        }))
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
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

    if (isPrismaAvailable()) {
      try {
        const achievement = await prisma.schoolAchievement.create({
          data: {
            schoolId,
            title: title.trim(),
            description: description || null,
            year: year ? Number(year) : null,
          },
        });
        res.status(201).json({ success: true, data: achievement });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const achievementId = generateCuid();
      const { data, error } = await supabase
        .from('school_achievements')
        .insert({
          id: achievementId,
          school_id: schoolId,
          title: title.trim(),
          description: description || null,
          year: year ? Number(year) : null,
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.status(201).json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          year: data.year,
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function deleteAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;

    if (isPrismaAvailable()) {
      try {
        const achievement = await prisma.schoolAchievement.findUnique({ where: { id } });
        if (!achievement || achievement.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');
        await prisma.schoolAchievement.delete({ where: { id } });
        res.json({ success: true, data: { id } });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { error } = await supabase
        .from('school_achievements')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({ success: true, data: { id } });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

// ─── Events ───────────────────────────────────────────────────

export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    if (isPrismaAvailable()) {
      try {
        const events = await prisma.schoolEvent.findMany({
          where: { schoolId },
          orderBy: { eventDate: 'asc' },
        });
        res.json({ success: true, data: events });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('school_events')
        .select('*')
        .eq('school_id', schoolId)
        .order('event_date', { ascending: true });

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({
        success: true,
        data: (data || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          eventDate: e.event_date,
          isPublic: e.is_public,
        }))
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
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

    if (isPrismaAvailable()) {
      try {
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
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const eventId = generateCuid();
      const { data, error } = await supabase
        .from('school_events')
        .insert({
          id: eventId,
          school_id: schoolId,
          title: title.trim(),
          description: description || null,
          event_date: new Date(eventDate).toISOString(),
          is_public: isPublic !== false,
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.status(201).json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          eventDate: data.event_date,
          isPublic: data.is_public,
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;
    const { title, description, eventDate, isPublic } = req.body;

    if (isPrismaAvailable()) {
      try {
        const existing = await prisma.schoolEvent.findUnique({ where: { id } });
        if (!existing || existing.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');

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
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const updatePayload: any = {};
      if (title !== undefined) updatePayload.title = title.trim();
      if (description !== undefined) updatePayload.description = description;
      if (eventDate !== undefined) updatePayload.event_date = new Date(eventDate).toISOString();
      if (isPublic !== undefined) updatePayload.is_public = Boolean(isPublic);

      const { data, error } = await supabase
        .from('school_events')
        .update(updatePayload)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          eventDate: data.event_date,
          isPublic: data.is_public,
        }
      });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const id = req.params.id as string;

    if (isPrismaAvailable()) {
      try {
        const event = await prisma.schoolEvent.findUnique({ where: { id } });
        if (!event || event.schoolId !== schoolId) throw new AppError('Not found', 404, 'NOT_FOUND');
        await prisma.schoolEvent.delete({ where: { id } });
        res.json({ success: true, data: { id } });
        return;
      } catch (err: any) {
        markPrismaFailure();
      }
    }

    if (supabase) {
      const { error } = await supabase
        .from('school_events')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw new AppError(error.message, 500, 'INTERNAL_ERROR');
      res.json({ success: true, data: { id } });
      return;
    }

    throw new AppError('Database service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } catch (error) {
    next(error);
  }
}
