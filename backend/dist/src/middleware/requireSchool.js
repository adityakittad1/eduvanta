"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSchool = void 0;
const errorHandler_1 = require("./errorHandler");
/**
 * Middleware to enforce multi-tenant data boundaries.
 * It checks if `schoolId` is present in req.params, req.query, or req.body.
 * If present, it must match the authenticated user's schoolId, UNLESS the user is a SUPER_ADMIN.
 *
 * NOTE: For most operations, the backend should ignore client-provided schoolId
 * and directly use `req.user.schoolId` in Prisma queries. This middleware provides
 * an extra layer of defense for endpoints that explicitly accept a schoolId.
 */
function requireSchool(req, _res, next) {
    if (!req.user) {
        return next(new errorHandler_1.AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    // SUPER_ADMIN can access any school
    if (req.user.role === 'SUPER_ADMIN') {
        return next();
    }
    if (!req.user.schoolId) {
        return next(new errorHandler_1.AppError('User is not assigned to a school', 403, 'FORBIDDEN'));
    }
    const userSchoolId = req.user.schoolId;
    // Extract requested schoolId from various places
    const targetSchoolId = req.params.schoolId ||
        req.query.schoolId ||
        req.body.schoolId;
    // If the client is explicitly asking for a schoolId, verify it matches
    if (targetSchoolId && targetSchoolId !== userSchoolId) {
        return next(new errorHandler_1.AppError('Cross-school data access forbidden', 403, 'FORBIDDEN'));
    }
    next();
}
exports.requireSchool = requireSchool;
//# sourceMappingURL=requireSchool.js.map