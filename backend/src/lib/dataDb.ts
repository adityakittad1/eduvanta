import crypto from 'crypto';
import { prisma } from './prisma';
import { supabase } from './supabase';
import { logger } from './logger';
import { isPrismaAvailable, markPrismaFailure } from './authDb';

export function generateCuid(): string {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

// ─── MAPPERS ──────────────────────────────────────────────────

export function mapSchool(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || null,
    logoUrl: row.logo_url || null,
    address: row.address || null,
    contactPhone: row.contact_phone || null,
    contactEmail: row.contact_email || null,
    principalName: row.principal_name || null,
    description: row.description || null,
    tagline: row.tagline || null,
    establishedYear: row.established_year || null,
    isActive: row.is_active ?? true,
    isPublicEnabled: row.is_public_enabled ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    _count: row._count || {
      students: row.student_count ?? 0,
      teachers: row.teacher_count ?? 0,
    },
  };
}

export function mapStudent(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    schoolId: row.school_id,
    userId: row.user_id || null,
    admissionNumber: row.admission_number,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : null,
    gender: row.gender || null,
    address: row.address || null,
    guardianName: row.guardian_name || null,
    guardianPhone: row.guardian_phone || null,
    classId: row.class_id || null,
    enrollmentDate: row.enrollment_date ? new Date(row.enrollment_date) : new Date(),
    academicYear: row.academic_year,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    class: row.classes
      ? {
          id: row.classes.id,
          name: row.classes.name,
          division: row.classes.division || null,
        }
      : row.class || null,
    user: row.users
      ? {
          email: row.users.email,
          isActive: row.users.is_active,
        }
      : row.user || null,
  };
}

export function mapClass(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    division: row.division || null,
    academicYear: row.academic_year,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    _count: row._count || {
      students: row.student_count ?? 0,
      subjects: row.subject_count ?? 0,
    },
  };
}

export function mapTeacher(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    schoolId: row.school_id,
    userId: row.user_id,
    employeeId: row.employee_id || null,
    firstName: row.first_name,
    lastName: row.last_name,
    qualification: row.qualification || null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    user: row.users
      ? {
          email: row.users.email,
          name: row.users.name || null,
          isActive: row.users.is_active,
        }
      : row.user || null,
  };
}

export function mapUser(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || null,
    role: row.role,
    schoolId: row.school_id || null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    school: row.schools ? { name: row.schools.name } : row.school || null,
  };
}

// ─── AUDIT LOGS ───────────────────────────────────────────────

export async function dbCreateAuditLog(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  schoolId?: string | null;
}): Promise<void> {
  if (isPrismaAvailable()) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          details: params.details || {},
          schoolId: params.schoolId || null,
        },
      });
      return;
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma createAuditLog failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const id = generateCuid();
      await supabase.from('audit_logs').insert({
        id,
        user_id: params.userId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        details: params.details || {},
        school_id: params.schoolId || null,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error('Supabase createAuditLog failed', { error: err?.message });
    }
  }
}

// ─── SCHOOLS ──────────────────────────────────────────────────

export async function dbFindSchoolBySlug(slug: string): Promise<any | null> {
  if (isPrismaAvailable()) {
    try {
      const s = await prisma.school.findUnique({ where: { slug } });
      if (s) return s;
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase.from('schools').select('*').eq('slug', slug).maybeSingle();
      if (data) return mapSchool(data);
    } catch (err: any) {
      logger.error('Supabase dbFindSchoolBySlug failed', { error: err?.message });
    }
  }
  return null;
}

export async function dbGetAllSchools(params: {
  skip: number;
  take: number;
  search?: string;
}): Promise<{ schools: any[]; total: number }> {
  if (isPrismaAvailable()) {
    try {
      const where = params.search
        ? { name: { contains: params.search, mode: 'insensitive' as const } }
        : {};

      const [schools, total] = await Promise.all([
        prisma.school.findMany({
          where,
          skip: params.skip,
          take: params.take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { students: true, teachers: true },
            },
          },
        }),
        prisma.school.count({ where }),
      ]);
      return { schools, total };
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbGetAllSchools failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      let query = supabase.from('schools').select('*', { count: 'exact' });
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }
      query = query.order('created_at', { ascending: false }).range(params.skip, params.skip + params.take - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      // Enhance with counts
      const enriched = await Promise.all(
        (data || []).map(async (row: any) => {
          const [{ count: studentCount }, { count: teacherCount }] = await Promise.all([
            supabase!.from('students').select('*', { count: 'exact', head: true }).eq('school_id', row.id),
            supabase!.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', row.id),
          ]);
          return mapSchool({
            ...row,
            student_count: studentCount || 0,
            teacher_count: teacherCount || 0,
          });
        })
      );

      return { schools: enriched, total: count || enriched.length };
    } catch (err: any) {
      logger.error('Supabase dbGetAllSchools failed', { error: err?.message });
    }
  }

  return { schools: [], total: 0 };
}

export async function dbGetSchoolById(id: string): Promise<any | null> {
  if (isPrismaAvailable()) {
    try {
      const school = await prisma.school.findUnique({
        where: { id },
        include: {
          _count: {
            select: { students: true, teachers: true },
          },
        },
      });
      if (school) return school;
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
      if (error || !data) return null;

      const [{ count: studentCount }, { count: teacherCount }] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', id),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', id),
      ]);

      return mapSchool({
        ...data,
        student_count: studentCount || 0,
        teacher_count: teacherCount || 0,
      });
    } catch (err: any) {
      logger.error('Supabase dbGetSchoolById failed', { error: err?.message });
    }
  }

  return null;
}

export async function dbCreateSchool(data: {
  name: string;
  slug: string;
  address?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  principalName?: string | null;
  description?: string | null;
  logoUrl?: string | null;
}): Promise<any> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.school.create({
        data: {
          name: data.name,
          slug: data.slug,
          address: data.address || null,
          contactPhone: data.contactPhone || null,
          contactEmail: data.contactEmail || null,
          principalName: data.principalName || null,
          description: data.description || null,
          logoUrl: data.logoUrl || null,
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbCreateSchool failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const id = generateCuid();
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from('schools')
      .insert({
        id,
        name: data.name,
        slug: data.slug,
        address: data.address || null,
        contact_phone: data.contactPhone || null,
        contact_email: data.contactEmail || null,
        principal_name: data.principalName || null,
        description: data.description || null,
        logo_url: data.logoUrl || null,
        is_active: true,
        is_public_enabled: true,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      logger.error('Supabase dbCreateSchool insert error', { error });
      throw new Error(error.message || 'Failed to create school');
    }
    return mapSchool(inserted);
  }

  throw new Error('Database service unavailable');
}

export async function dbUpdateSchool(id: string, data: any): Promise<any> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.school.update({
        where: { id },
        data: {
          ...data,
          contactEmail: data.contactEmail === '' ? null : data.contactEmail,
          logoUrl: data.logoUrl === '' ? null : data.logoUrl,
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbUpdateSchool failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.address !== undefined) updatePayload.address = data.address || null;
    if (data.contactPhone !== undefined) updatePayload.contact_phone = data.contactPhone || null;
    if (data.contactEmail !== undefined) updatePayload.contact_email = data.contactEmail || null;
    if (data.principalName !== undefined) updatePayload.principal_name = data.principalName || null;
    if (data.description !== undefined) updatePayload.description = data.description || null;
    if (data.logoUrl !== undefined) updatePayload.logo_url = data.logoUrl || null;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const { data: updated, error } = await supabase
      .from('schools')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapSchool(updated);
  }

  throw new Error('Database service unavailable');
}

// ─── STUDENTS ─────────────────────────────────────────────────

export async function dbGetStudents(params: {
  schoolId: string;
  classId?: string;
  skip: number;
  take: number;
}): Promise<{ students: any[]; total: number }> {
  if (isPrismaAvailable()) {
    try {
      const where: any = {
        schoolId: params.schoolId,
        ...(params.classId === 'null' ? { classId: null } : params.classId ? { classId: params.classId } : {}),
      };

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: {
            class: true,
            user: { select: { email: true, isActive: true } },
          },
          skip: params.skip,
          take: params.take,
          orderBy: { firstName: 'asc' },
        }),
        prisma.student.count({ where }),
      ]);
      return { students, total };
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbGetStudents failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          classes ( id, name, division ),
          users ( email, is_active )
        `, { count: 'exact' })
        .eq('school_id', params.schoolId);

      if (params.classId === 'null') {
        query = query.is('class_id', null);
      } else if (params.classId) {
        query = query.eq('class_id', params.classId);
      }

      query = query.order('first_name', { ascending: true }).range(params.skip, params.skip + params.take - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        students: (data || []).map(mapStudent),
        total: count || (data || []).length,
      };
    } catch (err: any) {
      logger.error('Supabase dbGetStudents failed', { error: err?.message });
    }
  }

  return { students: [], total: 0 };
}

export async function dbGetStudentById(id: string, schoolId: string): Promise<any | null> {
  if (isPrismaAvailable()) {
    try {
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          class: true,
          user: { select: { email: true, isActive: true } },
          earlyWarningFlags: { where: { isResolved: false } },
        },
      });
      if (student && student.schoolId === schoolId) return student;
      if (student) return null; // Belongs to different school
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes ( id, name, division ),
          users ( email, is_active )
        `)
        .eq('id', id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!error && data) return mapStudent(data);
    } catch (err: any) {
      logger.error('Supabase dbGetStudentById failed', { error: err?.message });
    }
  }

  return null;
}

export async function dbFindStudentByAdmission(schoolId: string, admissionNumber: string): Promise<any | null> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.student.findUnique({
        where: { schoolId_admissionNumber: { schoolId, admissionNumber } },
      });
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('admission_number', admissionNumber)
        .maybeSingle();
      if (data) return mapStudent(data);
    } catch (err: any) {
      logger.error('Supabase dbFindStudentByAdmission failed', { error: err?.message });
    }
  }

  return null;
}

export async function dbCreateStudent(params: {
  schoolId: string;
  userId?: string | null;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | null;
  gender?: any;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  academicYear: string;
  classId?: string | null;
}): Promise<any> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.student.create({
        data: {
          schoolId: params.schoolId,
          userId: params.userId || null,
          admissionNumber: params.admissionNumber,
          firstName: params.firstName,
          lastName: params.lastName,
          dateOfBirth: params.dateOfBirth || null,
          gender: params.gender || null,
          address: params.address || null,
          guardianName: params.guardianName || null,
          guardianPhone: params.guardianPhone || null,
          academicYear: params.academicYear,
          classId: params.classId || null,
        },
        include: {
          user: { select: { email: true } },
          class: true,
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbCreateStudent failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const id = generateCuid();
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from('students')
      .insert({
        id,
        school_id: params.schoolId,
        user_id: params.userId || null,
        admission_number: params.admissionNumber,
        first_name: params.firstName,
        last_name: params.lastName,
        date_of_birth: params.dateOfBirth ? params.dateOfBirth.toISOString() : null,
        gender: params.gender || null,
        address: params.address || null,
        guardian_name: params.guardianName || null,
        guardian_phone: params.guardianPhone || null,
        academic_year: params.academicYear,
        class_id: params.classId || null,
        is_active: true,
        created_at: now,
        updated_at: now,
      })
      .select(`
        *,
        classes ( id, name, division ),
        users ( email )
      `)
      .single();

    if (error) {
      logger.error('Supabase dbCreateStudent failed', { error });
      throw new Error(error.message);
    }

    return mapStudent(inserted);
  }

  throw new Error('Database service unavailable');
}

export async function dbUpdateStudent(id: string, schoolId: string, data: any): Promise<any> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.student.update({
        where: { id },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          classId: data.classId === '' ? null : data.classId,
        },
        include: {
          user: { select: { email: true } },
          class: true,
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbUpdateStudent failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
    if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
    if (data.admissionNumber !== undefined) updatePayload.admission_number = data.admissionNumber;
    if (data.dateOfBirth !== undefined) updatePayload.date_of_birth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null;
    if (data.gender !== undefined) updatePayload.gender = data.gender || null;
    if (data.address !== undefined) updatePayload.address = data.address || null;
    if (data.guardianName !== undefined) updatePayload.guardian_name = data.guardianName || null;
    if (data.guardianPhone !== undefined) updatePayload.guardian_phone = data.guardianPhone || null;
    if (data.academicYear !== undefined) updatePayload.academic_year = data.academicYear;
    if (data.classId !== undefined) updatePayload.class_id = data.classId || null;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const { data: updated, error } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select(`
        *,
        classes ( id, name, division ),
        users ( email )
      `)
      .single();

    if (error) throw new Error(error.message);
    return mapStudent(updated);
  }

  throw new Error('Database service unavailable');
}

// ─── CLASSES ──────────────────────────────────────────────────

export async function dbGetClasses(schoolId: string): Promise<any[]> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.class.findMany({
        where: { schoolId },
        include: {
          _count: {
            select: { students: true, subjects: true },
          },
        },
        orderBy: [{ name: 'asc' }, { division: 'asc' }],
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbGetClasses failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .order('name', { ascending: true })
        .order('division', { ascending: true });

      if (error) throw error;

      const enriched = await Promise.all(
        (data || []).map(async (cls: any) => {
          const [{ count: studentCount }, { count: subjectCount }] = await Promise.all([
            supabase!.from('students').select('*', { count: 'exact', head: true }).eq('class_id', cls.id),
            supabase!.from('subjects').select('*', { count: 'exact', head: true }).eq('class_id', cls.id),
          ]);
          return mapClass({
            ...cls,
            student_count: studentCount || 0,
            subject_count: subjectCount || 0,
          });
        })
      );
      return enriched;
    } catch (err: any) {
      logger.error('Supabase dbGetClasses failed', { error: err?.message });
    }
  }

  return [];
}

export async function dbGetClassById(id: string, schoolId: string): Promise<any | null> {
  if (isPrismaAvailable()) {
    try {
      const cls = await prisma.class.findUnique({
        where: { id },
        include: {
          students: { orderBy: { firstName: 'asc' } },
          subjects: {
            include: {
              teacherClassSubjects: { include: { teacher: true } },
            },
            orderBy: { name: 'asc' },
          },
        },
      });
      if (cls && cls.schoolId === schoolId) return cls;
      if (cls) return null;
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!error && data) {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', id)
          .order('first_name', { ascending: true });

        const mappedClass = mapClass(data);
        mappedClass.students = (students || []).map(mapStudent);
        mappedClass.subjects = [];
        return mappedClass;
      }
    } catch (err: any) {
      logger.error('Supabase dbGetClassById failed', { error: err?.message });
    }
  }

  return null;
}

export async function dbCreateClass(params: {
  schoolId: string;
  name: string;
  division?: string | null;
  academicYear: string;
}): Promise<any> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.class.create({
        data: {
          schoolId: params.schoolId,
          name: params.name,
          division: params.division || null,
          academicYear: params.academicYear,
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbCreateClass failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const id = generateCuid();
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from('classes')
      .insert({
        id,
        school_id: params.schoolId,
        name: params.name,
        division: params.division || null,
        academic_year: params.academicYear,
        is_active: true,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapClass(inserted);
  }

  throw new Error('Database service unavailable');
}

// ─── TEACHERS ─────────────────────────────────────────────────

export async function dbGetTeachers(params: {
  schoolId: string;
  skip: number;
  take: number;
}): Promise<{ teachers: any[]; total: number }> {
  if (isPrismaAvailable()) {
    try {
      const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
          where: { schoolId: params.schoolId },
          include: {
            user: { select: { email: true, isActive: true } },
          },
          skip: params.skip,
          take: params.take,
          orderBy: { firstName: 'asc' },
        }),
        prisma.teacher.count({ where: { schoolId: params.schoolId } }),
      ]);
      return { teachers, total };
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbGetTeachers failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      const { data, count, error } = await supabase
        .from('teachers')
        .select(`
          *,
          users ( email, is_active, name )
        `, { count: 'exact' })
        .eq('school_id', params.schoolId)
        .order('first_name', { ascending: true })
        .range(params.skip, params.skip + params.take - 1);

      if (error) throw error;

      return {
        teachers: (data || []).map(mapTeacher),
        total: count || (data || []).length,
      };
    } catch (err: any) {
      logger.error('Supabase dbGetTeachers failed', { error: err?.message });
    }
  }

  return { teachers: [], total: 0 };
}

export async function dbCreateTeacher(params: {
  schoolId: string;
  userId: string;
  firstName: string;
  lastName: string;
  employeeId?: string | null;
  qualification?: string | null;
}): Promise<any> {
  if (isPrismaAvailable()) {
    try {
      return await prisma.teacher.create({
        data: {
          schoolId: params.schoolId,
          userId: params.userId,
          firstName: params.firstName,
          lastName: params.lastName,
          employeeId: params.employeeId || null,
          qualification: params.qualification || null,
        },
        include: {
          user: { select: { email: true, name: true } },
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbCreateTeacher failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const id = generateCuid();
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from('teachers')
      .insert({
        id,
        school_id: params.schoolId,
        user_id: params.userId,
        first_name: params.firstName,
        last_name: params.lastName,
        employee_id: params.employeeId || null,
        qualification: params.qualification || null,
        is_active: true,
        created_at: now,
        updated_at: now,
      })
      .select(`
        *,
        users ( email, name )
      `)
      .single();

    if (error) throw new Error(error.message);
    return mapTeacher(inserted);
  }

  throw new Error('Database service unavailable');
}

// ─── USERS ────────────────────────────────────────────────────

export async function dbFindUserByEmail(email: string): Promise<any | null> {
  const normalizedEmail = email.toLowerCase().trim();
  if (isPrismaAvailable()) {
    try {
      const u = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (u) return u;
    } catch (err: any) {
      markPrismaFailure();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase.from('users').select('*').eq('email', normalizedEmail).maybeSingle();
      if (data) return mapUser(data);
    } catch (err: any) {
      logger.error('Supabase dbFindUserByEmail failed', { error: err?.message });
    }
  }

  return null;
}

export async function dbCreateUser(params: {
  email: string;
  name?: string | null;
  passwordHash: string;
  role: string;
  schoolId?: string | null;
  isActive?: boolean;
}): Promise<any> {
  const normalizedEmail = params.email.toLowerCase().trim();

  if (isPrismaAvailable()) {
    try {
      return await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: params.name || null,
          passwordHash: params.passwordHash,
          role: params.role as any,
          schoolId: params.schoolId || null,
          isActive: params.isActive ?? true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          schoolId: true,
          isActive: true,
          createdAt: true,
          school: { select: { name: true } },
        },
      });
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbCreateUser failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    const id = generateCuid();
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({
        id,
        email: normalizedEmail,
        name: params.name || null,
        password_hash: params.passwordHash,
        role: params.role,
        school_id: params.schoolId || null,
        is_active: params.isActive ?? true,
        created_at: now,
        updated_at: now,
      })
      .select(`
        id, email, name, role, school_id, is_active, created_at,
        schools ( name )
      `)
      .single();

    if (error) throw new Error(error.message);
    return mapUser(inserted);
  }

  throw new Error('Database service unavailable');
}

export async function dbGetAllUsers(params: {
  schoolId?: string;
  allowedRoles?: string[];
  role?: string;
  search?: string;
  skip: number;
  take: number;
}): Promise<{ users: any[]; total: number }> {
  if (isPrismaAvailable()) {
    try {
      const where: any = {};
      if (params.schoolId) where.schoolId = params.schoolId;
      if (params.allowedRoles) where.role = { in: params.allowedRoles };
      if (params.role) where.role = params.role;
      if (params.search) {
        where.OR = [
          { email: { contains: params.search, mode: 'insensitive' as const } },
          { name: { contains: params.search, mode: 'insensitive' as const } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: params.skip,
          take: params.take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            schoolId: true,
            isActive: true,
            createdAt: true,
            school: { select: { name: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);
      return { users, total };
    } catch (err: any) {
      markPrismaFailure();
      logger.warn('Prisma dbGetAllUsers failed, falling back to Supabase client', { error: err?.message });
    }
  }

  if (supabase) {
    try {
      let query = supabase
        .from('users')
        .select(`
          id, email, name, role, school_id, is_active, created_at,
          schools ( name )
        `, { count: 'exact' });

      if (params.schoolId) query = query.eq('school_id', params.schoolId);
      if (params.allowedRoles && params.allowedRoles.length > 0) query = query.in('role', params.allowedRoles);
      if (params.role) query = query.eq('role', params.role);
      if (params.search) {
        query = query.or(`email.ilike.%${params.search}%,name.ilike.%${params.search}%`);
      }

      query = query.order('created_at', { ascending: false }).range(params.skip, params.skip + params.take - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        users: (data || []).map(mapUser),
        total: count || (data || []).length,
      };
    } catch (err: any) {
      logger.error('Supabase dbGetAllUsers failed', { error: err?.message });
    }
  }

  return { users: [], total: 0 };
}
