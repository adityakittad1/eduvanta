import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantInfo;
    }
  }
}

import { resolveSchoolBySlug } from '../lib/authDb';

export async function tenantResolver(req: Request, _res: Response, next: NextFunction): Promise<void> {
  // 1. Check custom header first (used for cross-origin or explicit tenant API calls)
  const headerSlug = req.headers['x-tenant-slug'];
  if (typeof headerSlug === 'string' && headerSlug.trim() !== '') {
    const slug = headerSlug.trim();
    try {
      const school = await resolveSchoolBySlug(slug);
      if (!school) {
        return next(new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
      }
      req.tenant = {
        id: school.id,
        slug: school.slug ?? slug,
        name: school.name,
        logoUrl: school.logoUrl ?? undefined,
      };
      return next();
    } catch {
      return next(new AppError('Tenant resolution error', 500, 'TENANT_ERROR'));
    }
  }

  // 2. Parse host header
  const hostHeader = req.headers.host;
  if (!hostHeader) {
    return next();
  }

  const host = hostHeader.split(':')[0].toLowerCase();
  const rootDomain = (env.ROOT_DOMAIN || 'localhost').toLowerCase();

  // Root platform domains: skip tenant resolution
  if (
    host === rootDomain ||
    host === `admin.${rootDomain}` ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.vercel.app')
  ) {
    // Root domain or Vercel preview domain access without explicit header: proceed as root
    return next();
  }

  // Check if host is a subdomain of rootDomain
  if (rootDomain !== 'localhost' && host.endsWith(`.${rootDomain}`)) {
    const slug = host.replace(`.${rootDomain}`, '');
    if (!slug || slug === 'admin' || slug === 'www') {
      return next();
    }
    try {
      const school = await resolveSchoolBySlug(slug);
      if (!school) {
        return next(new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
      }
      req.tenant = {
        id: school.id,
        slug: school.slug ?? slug,
        name: school.name,
        logoUrl: school.logoUrl ?? undefined,
      };
      return next();
    } catch {
      return next(new AppError('Tenant resolution error', 500, 'TENANT_ERROR'));
    }
  }

  // Default fallback: allow through to let requireTenant guard protected routes
  return next();
}
