"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantResolver = void 0;
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const authDb_1 = require("../lib/authDb");
async function tenantResolver(req, _res, next) {
    // 1. Check custom header first (used for cross-origin or explicit tenant API calls)
    const headerSlug = req.headers['x-tenant-slug'];
    if (typeof headerSlug === 'string' && headerSlug.trim() !== '') {
        const slug = headerSlug.trim();
        try {
            const school = await (0, authDb_1.resolveSchoolBySlug)(slug);
            if (!school) {
                return next(new errorHandler_1.AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
            }
            req.tenant = {
                id: school.id,
                slug: school.slug ?? slug,
                name: school.name,
                logoUrl: school.logoUrl ?? undefined,
            };
            return next();
        }
        catch {
            return next(new errorHandler_1.AppError('Tenant resolution error', 500, 'TENANT_ERROR'));
        }
    }
    // 2. Parse host header
    const hostHeader = req.headers.host;
    if (!hostHeader) {
        return next();
    }
    const host = hostHeader.split(':')[0].toLowerCase();
    const rootDomain = (env_1.env.ROOT_DOMAIN || 'localhost').toLowerCase();
    // Root platform domains: skip tenant resolution
    if (host === rootDomain ||
        host === `admin.${rootDomain}` ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.vercel.app')) {
        // Root domain or Vercel preview domain access without explicit header: proceed as root
        return next();
    }
    // Check if host is a subdomain of rootDomain or *.localhost
    const isLocalhostSubdomain = host.endsWith('.localhost');
    const isRootSubdomain = rootDomain !== 'localhost' && host.endsWith(`.${rootDomain}`);
    if (isLocalhostSubdomain || isRootSubdomain) {
        const slug = isLocalhostSubdomain ? host.replace(/\.localhost$/, '') : host.replace(`.${rootDomain}`, '');
        if (!slug || slug === 'admin' || slug === 'www') {
            return next();
        }
        try {
            const school = await (0, authDb_1.resolveSchoolBySlug)(slug);
            if (!school) {
                return next(new errorHandler_1.AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
            }
            req.tenant = {
                id: school.id,
                slug: school.slug ?? slug,
                name: school.name,
                logoUrl: school.logoUrl ?? undefined,
            };
            return next();
        }
        catch {
            return next(new errorHandler_1.AppError('Tenant resolution error', 500, 'TENANT_ERROR'));
        }
    }
    // Default fallback: allow through to let requireTenant guard protected routes
    return next();
}
exports.tenantResolver = tenantResolver;
//# sourceMappingURL=tenantResolver.js.map