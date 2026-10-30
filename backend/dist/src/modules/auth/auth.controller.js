"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.requireSchool = exports.requireRole = exports.authenticate = exports.refreshTokens = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middleware/errorHandler");
const logger_1 = require("../../lib/logger");
const authDb_1 = require("../../lib/authDb");
function generateAccessToken(user) {
    return jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, schoolId: user.schoolId }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await (0, authDb_1.findUserForLogin)(email);
        if (!user || !user.isActive) {
            throw new errorHandler_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        if (user.school && !user.school.isActive) {
            throw new errorHandler_1.AppError('Your school account has been deactivated. Please contact support.', 403, 'FORBIDDEN');
        }
        // ---- Tenant consistency check ----
        // If request resolved a tenant (subdomain), ensure the user belongs to that tenant.
        // SUPER_ADMIN may login without a tenant (root domain) or any tenant.
        if (req.tenant && req.tenant.id && user.schoolId && user.schoolId !== req.tenant.id && user.role !== 'SUPER_ADMIN') {
            throw new errorHandler_1.AppError('Tenant mismatch: this account belongs to a different school', 403, 'TENANT_MISMATCH');
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
        const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordValid) {
            throw new errorHandler_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const authUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
        };
        const accessToken = generateAccessToken(authUser);
        const refreshToken = generateRefreshToken(user.id);
        // Store refresh token hash in DB
        const tokenHash = await bcryptjs_1.default.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await (0, authDb_1.saveRefreshToken)(user.id, tokenHash, expiresAt);
        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        logger_1.logger.info('User logged in', { userId: user.id, role: user.role });
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
    }
    catch (error) {
        next(error);
    }
}
exports.login = login;
async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            // Find and revoke all tokens for user (or just the matching one)
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            await (0, authDb_1.revokeAllUserRefreshTokens)(decoded.userId);
        }
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch {
        // Even if token verification fails, clear the cookie
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    }
}
exports.logout = logout;
async function refreshTokens(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new errorHandler_1.AppError('No refresh token', 401, 'UNAUTHORIZED');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new errorHandler_1.AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
        }
        // Find valid token records for user
        const tokenRecords = await (0, authDb_1.findValidRefreshTokens)(decoded.userId);
        // Verify against stored hashes
        let validRecord = null;
        for (const record of tokenRecords) {
            const matches = await bcryptjs_1.default.compare(refreshToken, record.tokenHash);
            if (matches) {
                validRecord = record;
                break;
            }
        }
        if (!validRecord) {
            throw new errorHandler_1.AppError('Refresh token not recognized', 401, 'UNAUTHORIZED');
        }
        // Revoke old token
        await (0, authDb_1.revokeRefreshToken)(validRecord.id);
        const user = await (0, authDb_1.findUserProfileById)(decoded.userId);
        if (!user || !user.isActive) {
            throw new errorHandler_1.AppError('User not found or inactive', 401, 'UNAUTHORIZED');
        }
        const authUser = { id: user.id, email: user.email, name: user.name, role: user.role, schoolId: user.schoolId };
        const newAccessToken = generateAccessToken(authUser);
        const newRefreshToken = generateRefreshToken(user.id);
        const newTokenHash = await bcryptjs_1.default.hash(newRefreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await (0, authDb_1.saveRefreshToken)(user.id, newTokenHash, expiresAt);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            data: { accessToken: newAccessToken },
        });
    }
    catch (error) {
        next(error);
    }
}
exports.refreshTokens = refreshTokens;
// ─── Middleware ──────────────────────────────────────────────
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new errorHandler_1.AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        // Verify tenant consistency (unless SUPER_ADMIN)
        if (req.tenant && decoded.schoolId && decoded.schoolId !== req.tenant.id && decoded.role !== 'SUPER_ADMIN') {
            return next(new errorHandler_1.AppError('Tenant mismatch', 403, 'TENANT_MISMATCH'));
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
    }
    catch {
        next(new errorHandler_1.AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
}
exports.authenticate = authenticate;
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Authentication required', 401, 'UNAUTHORIZED'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Access denied', 403, 'FORBIDDEN'));
        }
        next();
    };
}
exports.requireRole = requireRole;
function requireSchool(req, _res, next) {
    if (req.user?.role === 'SUPER_ADMIN') {
        return next();
    }
    const tenantId = req.tenant?.id || req.user?.schoolId;
    if (!tenantId) {
        return next(new errorHandler_1.AppError('School context required', 400, 'BAD_REQUEST'));
    }
    // Enforce tenant match if both req.tenant and req.user.schoolId are present
    if (req.tenant && req.user?.schoolId && req.user.schoolId !== req.tenant.id) {
        return next(new errorHandler_1.AppError('Tenant mismatch', 403, 'TENANT_MISMATCH'));
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
exports.requireSchool = requireSchool;
async function getMe(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Not authenticated', 401, 'UNAUTHORIZED');
        const user = await (0, authDb_1.findUserProfileById)(req.user.id);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404, 'NOT_FOUND');
        // Derive display name: explicit name field → teacher name → student name → email prefix
        const displayName = user.name
            || (user.teacher ? `${user.teacher.firstName} ${user.teacher.lastName}`.trim() : null)
            || (user.student ? `${user.student.firstName} ${user.student.lastName}`.trim() : null)
            || user.email.split('@')[0];
        res.json({ success: true, data: { ...user, name: displayName } });
    }
    catch (error) {
        next(error);
    }
}
exports.getMe = getMe;
async function changePassword(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Not authenticated', 401, 'UNAUTHORIZED');
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { passwordHash: true },
        });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404, 'NOT_FOUND');
        const passwordValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!passwordValid) {
            throw new errorHandler_1.AppError('Incorrect current password', 400, 'BAD_REQUEST');
        }
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newPasswordHash },
        });
        // Revoke all refresh tokens to force re-login on other devices
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId: req.user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        logger_1.logger.info('User changed password', { userId: req.user.id });
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
}
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map