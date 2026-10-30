"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicSchools = exports.resolveSchoolBySlug = exports.revokeAllUserRefreshTokens = exports.revokeRefreshToken = exports.findValidRefreshTokens = exports.saveRefreshToken = exports.findUserProfileById = exports.findUserForLogin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("./prisma");
const supabase_1 = require("./supabase");
const logger_1 = require("./logger");
async function findUserForLogin(email) {
    const normalizedEmail = email.toLowerCase().trim();
    // 1. Try Prisma first
    try {
        const user = await prisma_1.prisma.user.findUnique({
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
        if (user)
            return user;
    }
    catch (err) {
        logger_1.logger.warn('Prisma findUserForLogin failed, falling back to Supabase client', { error: err?.message });
    }
    // 2. Fallback to Supabase REST client
    if (supabase_1.supabase) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('users')
                .select(`
          id, email, name, password_hash, role, school_id, is_active,
          schools ( id, name, logo_url, is_active, slug ),
          students ( id )
        `)
                .eq('email', normalizedEmail)
                .maybeSingle();
            if (!error && data) {
                const rawSchool = data.schools;
                const rawStudents = data.students;
                return {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    passwordHash: data.password_hash,
                    role: data.role,
                    schoolId: data.school_id,
                    isActive: data.is_active,
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
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client findUserForLogin failed', { error: sbErr?.message });
        }
    }
    return null;
}
exports.findUserForLogin = findUserForLogin;
async function findUserProfileById(userId) {
    // 1. Try Prisma first
    try {
        const user = await prisma_1.prisma.user.findUnique({
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
        if (user)
            return user;
    }
    catch (err) {
        logger_1.logger.warn('Prisma findUserProfileById failed, falling back to Supabase client', { error: err?.message });
    }
    // 2. Fallback to Supabase REST client
    if (supabase_1.supabase) {
        try {
            const { data, error } = await supabase_1.supabase
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
                const rawSchool = data.schools;
                const rawStudents = data.students;
                const rawTeachers = data.teachers;
                return {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    role: data.role,
                    schoolId: data.school_id,
                    isActive: data.is_active,
                    createdAt: new Date(data.created_at),
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
                    student: Array.isArray(rawStudents) && rawStudents.length > 0
                        ? {
                            id: rawStudents[0].id,
                            firstName: rawStudents[0].first_name,
                            lastName: rawStudents[0].last_name,
                            classId: rawStudents[0].class_id || null,
                        }
                        : null,
                    teacher: Array.isArray(rawTeachers) && rawTeachers.length > 0
                        ? {
                            id: rawTeachers[0].id,
                            firstName: rawTeachers[0].first_name,
                            lastName: rawTeachers[0].last_name,
                        }
                        : null,
                };
            }
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client findUserProfileById failed', { error: sbErr?.message });
        }
    }
    return null;
}
exports.findUserProfileById = findUserProfileById;
async function saveRefreshToken(userId, tokenHash, expiresAt) {
    // 1. Try Prisma first
    try {
        await prisma_1.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
        return;
    }
    catch (err) {
        logger_1.logger.warn('Prisma saveRefreshToken failed, falling back to Supabase client', { error: err?.message });
    }
    // 2. Fallback to Supabase REST client
    if (supabase_1.supabase) {
        try {
            const id = 'c' + crypto_1.default.randomBytes(12).toString('hex');
            await supabase_1.supabase.from('refresh_tokens').insert({
                id,
                user_id: userId,
                token_hash: tokenHash,
                expires_at: expiresAt.toISOString(),
            });
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client saveRefreshToken failed', { error: sbErr?.message });
        }
    }
}
exports.saveRefreshToken = saveRefreshToken;
async function findValidRefreshTokens(userId) {
    // 1. Try Prisma first
    try {
        const records = await prisma_1.prisma.refreshToken.findMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: { id: true, tokenHash: true },
        });
        if (records)
            return records;
    }
    catch (err) {
        logger_1.logger.warn('Prisma findValidRefreshTokens failed, falling back to Supabase client', { error: err?.message });
    }
    // 2. Fallback to Supabase REST client
    if (supabase_1.supabase) {
        try {
            const { data } = await supabase_1.supabase
                .from('refresh_tokens')
                .select('id, token_hash')
                .eq('user_id', userId)
                .is('revoked_at', null)
                .gt('expires_at', new Date().toISOString());
            if (data) {
                return data.map((r) => ({ id: r.id, tokenHash: r.token_hash }));
            }
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client findValidRefreshTokens failed', { error: sbErr?.message });
        }
    }
    return [];
}
exports.findValidRefreshTokens = findValidRefreshTokens;
async function revokeRefreshToken(tokenId) {
    try {
        await prisma_1.prisma.refreshToken.update({
            where: { id: tokenId },
            data: { revokedAt: new Date() },
        });
        return;
    }
    catch (err) {
        logger_1.logger.warn('Prisma revokeRefreshToken failed, falling back to Supabase client', { error: err?.message });
    }
    if (supabase_1.supabase) {
        try {
            await supabase_1.supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', tokenId);
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client revokeRefreshToken failed', { error: sbErr?.message });
        }
    }
}
exports.revokeRefreshToken = revokeRefreshToken;
async function revokeAllUserRefreshTokens(userId) {
    try {
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return;
    }
    catch (err) {
        logger_1.logger.warn('Prisma revokeAllUserRefreshTokens failed, falling back to Supabase client', { error: err?.message });
    }
    if (supabase_1.supabase) {
        try {
            await supabase_1.supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null);
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client revokeAllUserRefreshTokens failed', { error: sbErr?.message });
        }
    }
}
exports.revokeAllUserRefreshTokens = revokeAllUserRefreshTokens;
async function resolveSchoolBySlug(slug) {
    try {
        const school = await prisma_1.prisma.school.findUnique({
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
    }
    catch (err) {
        logger_1.logger.warn('Prisma resolveSchoolBySlug failed, falling back to Supabase client', { error: err?.message });
    }
    if (supabase_1.supabase) {
        try {
            const { data } = await supabase_1.supabase
                .from('schools')
                .select('id, slug, name, logo_url')
                .eq('slug', slug)
                .maybeSingle();
            if (data) {
                return {
                    id: data.id,
                    slug: data.slug || slug,
                    name: data.name,
                    logoUrl: data.logo_url || undefined,
                };
            }
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client resolveSchoolBySlug failed', { error: sbErr?.message });
        }
    }
    return null;
}
exports.resolveSchoolBySlug = resolveSchoolBySlug;
async function listPublicSchools() {
    try {
        const schools = await prisma_1.prisma.school.findMany({
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
        if (schools && schools.length > 0)
            return schools;
    }
    catch (err) {
        logger_1.logger.warn('Prisma listPublicSchools failed, falling back to Supabase client', { error: err?.message });
    }
    if (supabase_1.supabase) {
        try {
            const { data } = await supabase_1.supabase
                .from('schools')
                .select('id, name, slug, logo_url, tagline, description, address, established_year, principal_name')
                .eq('is_active', true)
                .eq('is_public_enabled', true)
                .order('name', { ascending: true });
            if (data) {
                return data.map((s) => ({
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
        }
        catch (sbErr) {
            logger_1.logger.error('Supabase client listPublicSchools failed', { error: sbErr?.message });
        }
    }
    return [];
}
exports.listPublicSchools = listPublicSchools;
//# sourceMappingURL=authDb.js.map