import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../lib/logger';
import { LoginInput, ChangePasswordInput } from './auth.schema';
import { Role } from '@prisma/client';
import {
  findUserForLogin,
  findUserProfileById,
  saveRefreshToken,
  findValidRefreshTokens,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from '../../lib/authDb';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  schoolId: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, role: user.role, schoolId: user.schoolId },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await findUserForLogin(email);

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.school && !user.school.isActive) {
      throw new AppError('Your school account has been deactivated. Please contact support.', 403, 'FORBIDDEN');
    }

    // ---- Tenant consistency check ----
    // If request resolved a tenant (subdomain), ensure the user belongs to that tenant.
    // SUPER_ADMIN may login without a tenant (root domain) or any tenant.
    if (req.tenant && req.tenant.id && user.schoolId && user.schoolId !== req.tenant.id && user.role !== 'SUPER_ADMIN') {
      throw new AppError('Tenant mismatch: this account belongs to a different school', 403, 'TENANT_MISMATCH');
    }
    // If no tenant was resolved from hostname (e.g. root domain login), adopt the user's assigned school as the tenant context.
    if (!req.tenant && user.school) {
      req.tenant = {
        id: user.school.id,
        slug: user.school.slug ?? '',
        name: user.school.name,
        logoUrl: user.school.logoUrl ?? undefined,
      };
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
    };

    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token hash in DB
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await saveRefreshToken(user.id, tokenHash, expiresAt);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info('User logged in', { userId: user.id, role: user.role });

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          // Include full school object so frontend has name + logo immediately
          school: user.school
            ? { id: user.schoolId, name: user.school.name, logoUrl: user.school.logoUrl, slug: user.school.slug }
            : null,
          student: user.student,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      // Find and revoke all tokens for user (or just the matching one)
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      await revokeAllUserRefreshTokens(decoded.userId);
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    // Even if token verification fails, clear the cookie
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  }
}

export async function refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new AppError('No refresh token', 401, 'UNAUTHORIZED');
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    }

    // Find valid token records for user
    const tokenRecords = await findValidRefreshTokens(decoded.userId);

    // Verify against stored hashes
    let validRecord = null;
    for (const record of tokenRecords) {
      const matches = await bcrypt.compare(refreshToken, record.tokenHash);
      if (matches) {
        validRecord = record;
        break;
      }
    }

    if (!validRecord) {
      throw new AppError('Refresh token not recognized', 401, 'UNAUTHORIZED');
    }

    // Revoke old token
    await revokeRefreshToken(validRecord.id);

    const user = await findUserProfileById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401, 'UNAUTHORIZED');
    }

    const authUser: AuthUser = { id: user.id, email: user.email, name: user.name, role: user.role, schoolId: user.schoolId };
    const newAccessToken = generateAccessToken(authUser);
    const newRefreshToken = generateRefreshToken(user.id);

    const newTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await saveRefreshToken(user.id, newTokenHash, expiresAt);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Middleware ──────────────────────────────────────────────

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      role: Role;
      schoolId: string | null;
    };
    // Verify tenant consistency (unless SUPER_ADMIN)
    if (req.tenant && decoded.schoolId && decoded.schoolId !== req.tenant.id && decoded.role !== 'SUPER_ADMIN') {
      return next(new AppError('Tenant mismatch', 403, 'TENANT_MISMATCH'));
    }
    req.user = {
      id: decoded.userId,
      email: '',
      name: null,
      role: decoded.role,
      schoolId: decoded.schoolId,
    };
    // If req.tenant was not resolved via subdomain/header, populate it from user's school context
    if (!req.tenant && decoded.schoolId) {
      req.tenant = {
        id: decoded.schoolId,
        slug: '',
        name: '',
      };
    }
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user!.role)) {
      return next(new AppError('Access denied', 403, 'FORBIDDEN'));
    }
    next();
  };
}

export function requireSchool(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }
  const tenantId = req.tenant?.id || req.user?.schoolId;
  if (!tenantId) {
    return next(new AppError('School context required', 400, 'BAD_REQUEST'));
  }
  // Enforce tenant match if both req.tenant and req.user.schoolId are present
  if (req.tenant && req.user?.schoolId && req.user.schoolId !== req.tenant.id) {
    return next(new AppError('Tenant mismatch', 403, 'TENANT_MISMATCH'));
  }
  if (!req.tenant && req.user?.schoolId) {
    req.tenant = {
      id: req.user.schoolId,
      slug: '',
      name: '',
    };
  }
  next();
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');

    const user = await findUserProfileById(req.user!.id);

    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    // Derive display name: explicit name field → teacher name → student name → email prefix
    const displayName = user.name
      || (user.teacher ? `${user.teacher.firstName} ${user.teacher.lastName}`.trim() : null)
      || (user.student ? `${user.student.firstName} ${user.student.lastName}`.trim() : null)
      || user.email.split('@')[0];

    res.json({ success: true, data: { ...user, name: displayName } });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');

    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { passwordHash: true },
    });

    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('Incorrect current password', 400, 'BAD_REQUEST');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens to force re-login on other devices
    await prisma.refreshToken.updateMany({
      where: { userId: req.user!.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info('User changed password', { userId: req.user!.id });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}
