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
  const hostHeader = req.headers.host;
  if (!hostHeader) {
    return next(new AppError('Host header missing', 400, 'BAD_REQUEST'));
  }

  // Strip port if present
  const host = hostHeader.split(':')[0];
  const rootDomain = env.ROOT_DOMAIN || 'localhost';

  console.log('tenantResolver -> host:', host, 'rootDomain:', rootDomain, 'admin:', `admin.${rootDomain}`);

  // If request is to the root domain or 'admin' subdomain, skip tenant resolution
  if (host === rootDomain || host === `admin.${rootDomain}`) {
    console.log('Skipping tenant resolution for:', host);
    return next();
  }

  const slug = host.replace(`.${rootDomain}`, '');
  console.log('Resolving tenant slug:', slug);

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
