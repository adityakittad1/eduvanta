import crypto from 'crypto';
import { prisma } from './prisma';
import { supabase } from './supabase';
import { logger } from './logger';
import { Role } from '@prisma/client';

export interface AuthDbUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  role: Role;
  schoolId: string | null;
  isActive: boolean;
  school: {
    id: string;
    name: string;
    logoUrl: string | null;
    isActive: boolean;
    slug: string | null;
  } | null;
  student: {
    id: string;
  } | null;
}

export interface AuthDbUserProfile {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  schoolId: string | null;
  isActive: boolean;
  createdAt: Date;
  school: {
    id: string;
    name: string;
    logoUrl: string | null;
    slug: string | null;
    address: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    principalName: string | null;
    tagline: string | null;
    establishedYear: number | null;
    isPublicEnabled: boolean;
  } | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    classId: string | null;
  } | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

let prismaDisabledUntil = 0;

export function isPrismaAvailable(): boolean {
  return Date.now() > prismaDisabledUntil;
}

export function markPrismaFailure(): void {
  // Cooldown for 30s before attempting Prisma again
  prismaDisabledUntil = Date.now() + 30000;
}

export async function findUserForLogin(email: string): Promise<AuthDbUser | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Try Prisma first if healthy
  if (isPrismaAvailable()) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          role: true,
          schoolId: true,
          isActive: true,
          school: {
            select: { id: true, name: true, logoUrl: true, isActive: true, slug: true },
          },
          student: {
            select: { id: true },
          },
        },
      });
      if (user) return user;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma findUserForLogin failed, falling back to Supabase client', { error: err?.message });
    }
  }

  // 2. Fallback to Supabase REST client
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, email, name, password_hash, role, school_id, is_active,
          schools ( id, name, logo_url, is_active, slug ),
          students ( id )
        `)
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        const rawSchool = (data as any).schools;
        const rawStudents = (data as any).students;
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          passwordHash: (data as any).password_hash,
          role: data.role as Role,
          schoolId: (data as any).school_id,
          isActive: (data as any).is_active,
          school: rawSchool
            ? {
                id: rawSchool.id,
                name: rawSchool.name,
                logoUrl: rawSchool.logo_url || null,
                isActive: rawSchool.is_active,
                slug: rawSchool.slug || null,
              }
            : null,
          student: Array.isArray(rawStudents) && rawStudents.length > 0 ? { id: rawStudents[0].id } : null,
        };
      }
    } catch (sbErr: any) {
      logger.error('Supabase client findUserForLogin failed', { error: sbErr?.message });
    }
  }

  return null;
}

export async function findUserProfileById(userId: string): Promise<AuthDbUserProfile | null> {
  // 1. Try Prisma first
  if (isPrismaAvailable()) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          schoolId: true,
          isActive: true,
          createdAt: true,
          school: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              slug: true,
              address: true,
              contactPhone: true,
              contactEmail: true,
              principalName: true,
              tagline: true,
              establishedYear: true,
              isPublicEnabled: true,
            },
          },
          student: {
            select: { id: true, firstName: true, lastName: true, classId: true },
          },
          teacher: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
      if (user) return user;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma findUserProfileById failed, falling back to Supabase client', { error: err?.message });
    }
  }

  // 2. Fallback to Supabase REST client
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, email, name, role, school_id, is_active, created_at,
          schools ( id, name, logo_url, slug, address, contact_phone, contact_email, principal_name, tagline, established_year, is_public_enabled ),
          students ( id, first_name, last_name, class_id ),
          teachers ( id, first_name, last_name )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        const rawSchool = (data as any).schools;
        const rawStudents = (data as any).students;
        const rawTeachers = (data as any).teachers;

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as Role,
          schoolId: (data as any).school_id,
          isActive: (data as any).is_active,
          createdAt: new Date((data as any).created_at),
          school: rawSchool
            ? {
                id: rawSchool.id,
                name: rawSchool.name,
                logoUrl: rawSchool.logo_url || null,
                slug: rawSchool.slug || null,
                address: rawSchool.address || null,
                contactPhone: rawSchool.contact_phone || null,
                contactEmail: rawSchool.contact_email || null,
                principalName: rawSchool.principal_name || null,
                tagline: rawSchool.tagline || null,
                establishedYear: rawSchool.established_year || null,
                isPublicEnabled: rawSchool.is_public_enabled ?? true,
              }
            : null,
          student:
            Array.isArray(rawStudents) && rawStudents.length > 0
              ? {
                  id: rawStudents[0].id,
                  firstName: rawStudents[0].first_name,
                  lastName: rawStudents[0].last_name,
                  classId: rawStudents[0].class_id || null,
                }
              : null,
          teacher:
            Array.isArray(rawTeachers) && rawTeachers.length > 0
              ? {
                  id: rawTeachers[0].id,
                  firstName: rawTeachers[0].first_name,
                  lastName: rawTeachers[0].last_name,
                }
              : null,
        };
      }
    } catch (sbErr: any) {
      logger.error('Supabase client findUserProfileById failed', { error: sbErr?.message });
    }
  }

  return null;
}

export async function saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  // 1. Try Prisma first
  if (isPrismaAvailable()) {
    try {
      await prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      return;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma saveRefreshToken failed, falling back to Supabase client', { error: err?.message });
    }
  }

  // 2. Fallback to Supabase REST client
  if (supabase) {
    try {
      const id = 'c' + crypto.randomBytes(12).toString('hex');
      await supabase.from('refresh_tokens').insert({
        id,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });
    } catch (sbErr: any) {
      logger.error('Supabase client saveRefreshToken failed', { error: sbErr?.message });
    }
  }
}

export async function findValidRefreshTokens(userId: string): Promise<Array<{ id: string; tokenHash: string }>> {
  // 1. Try Prisma first
  if (isPrismaAvailable()) {
    try {
      const records = await prisma.refreshToken.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true, tokenHash: true },
      });
      if (records) return records;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma findValidRefreshTokens failed, falling back to Supabase client', { error: err?.message });
    }
  }

  // 2. Fallback to Supabase REST client
  if (supabase) {
    try {
      const { data } = await supabase
        .from('refresh_tokens')
        .select('id, token_hash')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString());

      if (data) {
        return data.map((r: any) => ({ id: r.id, tokenHash: r.token_hash }));
      }
    } catch (sbErr: any) {
      logger.error('Supabase client findValidRefreshTokens failed', { error: sbErr?.message });
    }
  }

  return [];
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
  try {
    await prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
    return;
  } catch (err: any) {
    logger.warn('Prisma revokeRefreshToken failed, falling back to Supabase client', { error: err?.message });
  }

  if (supabase) {
    try {
      await supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', tokenId);
    } catch (sbErr: any) {
      logger.error('Supabase client revokeRefreshToken failed', { error: sbErr?.message });
    }
  }
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return;
  } catch (err: any) {
    logger.warn('Prisma revokeAllUserRefreshTokens failed, falling back to Supabase client', { error: err?.message });
  }

  if (supabase) {
    try {
      await supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null);
    } catch (sbErr: any) {
      logger.error('Supabase client revokeAllUserRefreshTokens failed', { error: sbErr?.message });
    }
  }
}

export async function resolveSchoolBySlug(slug: string): Promise<{ id: string; slug: string; name: string; logoUrl?: string } | null> {
  if (isPrismaAvailable()) {
    try {
      const school = await prisma.school.findUnique({
        where: { slug },
        select: { id: true, slug: true, name: true, logoUrl: true },
      });
      if (school) {
        return {
          id: school.id,
          slug: school.slug ?? slug,
          name: school.name,
          logoUrl: school.logoUrl ?? undefined,
        };
      }
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma resolveSchoolBySlug failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('schools')
        .select('id, slug, name, logo_url')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          slug: data.slug || slug,
          name: data.name,
          logoUrl: (data as any).logo_url || undefined,
        };
      }
    } catch (sbErr: any) {
      logger.error('Supabase client resolveSchoolBySlug failed', { error: sbErr?.message });
    }
  }

  return null;
}

export async function listPublicSchools(): Promise<any[]> {
  if (isPrismaAvailable()) {
    try {
      const schools = await prisma.school.findMany({
        where: { isActive: true, isPublicEnabled: true },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          tagline: true,
          description: true,
          address: true,
          establishedYear: true,
          principalName: true,
        },
        orderBy: { name: 'asc' },
      });
      if (schools && schools.length > 0) return schools;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma listPublicSchools failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('schools')
        .select('id, name, slug, logo_url, tagline, description, address, established_year, principal_name')
        .eq('is_active', true)
        .eq('is_public_enabled', true)
        .order('name', { ascending: true });

      if (data) {
        return data.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          logoUrl: s.logo_url || null,
          tagline: s.tagline || null,
          description: s.description || null,
          address: s.address || null,
          establishedYear: s.established_year || null,
          principalName: s.principal_name || null,
        }));
      }
    } catch (sbErr: any) {
      logger.error('Supabase client listPublicSchools failed', { error: sbErr?.message });
    }
  }

  return [];
}
