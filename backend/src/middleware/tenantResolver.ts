import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
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

export async function tenantResolver(req: Request, _res: Response, next: NextFunction): Promise<void> {
  // 1. Check custom header first (used for cross-origin API calls)
  const headerSlug = req.headers['x-tenant-slug'];
  
  // 2. Fallback to parsing host
  const hostHeader = req.headers.host;
  let slug = '';
  
  if (typeof headerSlug === 'string' && headerSlug.trim() !== '') {
    slug = headerSlug.trim();
  } else if (hostHeader) {
    const host = hostHeader.split(':')[0];
    const rootDomain = env.ROOT_DOMAIN || 'localhost';

    // If request is to the root domain or 'admin' subdomain, skip tenant resolution
    if (host === rootDomain || host === `admin.${rootDomain}`) {
      return next();
    }
    slug = host.replace(`.${rootDomain}`, '');
  }

  if (!slug) {
    return next(new AppError('Tenant slug could not be determined', 400, 'BAD_REQUEST'));
  }

  try {
    const school = await prisma.school.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, logoUrl: true },
    });
    if (!school) {
      return next(new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
    }
    req.tenant = {
      id: school.id,
      slug: school.slug ?? slug,
      name: school.name,
      logoUrl: school.logoUrl ?? undefined,
    };
    next();
  } catch (err) {
    next(new AppError('Tenant resolution error', 500, 'TENANT_ERROR'));
  }
}
