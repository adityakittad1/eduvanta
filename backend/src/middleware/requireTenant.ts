import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

import { env } from '../config/env';

export function requireTenant(req: Request, _res: Response, next: NextFunction): void {
  const hostHeader = req.headers.host;
  if (!hostHeader) {
    return next(new AppError('Host header missing', 400, 'BAD_REQUEST'));
  }

  const host = hostHeader.split(':')[0];
  const rootDomain = env.ROOT_DOMAIN || 'localhost';

  // If request is to the root domain or admin subdomain, skip the requirement
  if (host === rootDomain || host === `admin.${rootDomain}`) {
    return next();
  }

  // tenantResolver should have attached req.tenant; if missing, the request is not scoped to a known school.
  if (!req.tenant) {
    // For API routes (protected), lack of tenant is a configuration error or invalid subdomain.
    return next(new AppError('Tenant could not be resolved from subdomain', 400, 'TENANT_RESOLUTION_ERROR'));
  }
  next();
}
