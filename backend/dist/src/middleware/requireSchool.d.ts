/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to enforce multi-tenant data boundaries.
 * It checks if `schoolId` is present in req.params, req.query, or req.body.
 * If present, it must match the authenticated user's schoolId, UNLESS the user is a SUPER_ADMIN.
 *
 * NOTE: For most operations, the backend should ignore client-provided schoolId
 * and directly use `req.user.schoolId` in Prisma queries. This middleware provides
 * an extra layer of defense for endpoints that explicitly accept a schoolId.
 */
export declare function requireSchool(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=requireSchool.d.ts.map