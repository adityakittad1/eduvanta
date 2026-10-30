"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
// Health check router
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', async (_req, res) => {
    let dbStatus = 'connected';
    let dbError = null;
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (err) {
        dbStatus = 'disconnected';
        dbError = err instanceof Error ? err.message : String(err);
    }
    let dbTarget = 'not_configured';
    if (process.env.DATABASE_URL) {
        try {
            const u = new URL(process.env.DATABASE_URL);
            dbTarget = `${u.protocol}//${u.host}${u.pathname}`;
        }
        catch {
            dbTarget = 'invalid_url_format';
        }
    }
    const healthy = dbStatus === 'connected';
    res.status(200).json({
        success: true,
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: {
            status: dbStatus,
            target: dbTarget,
            error: dbError,
        },
        envCheck: {
            hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
            hasDirectUrl: Boolean(process.env.DIRECT_URL),
            hasJwtAccessSecret: Boolean(process.env.JWT_ACCESS_SECRET),
            hasJwtRefreshSecret: Boolean(process.env.JWT_REFRESH_SECRET),
            hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
            hasSupabaseKey: Boolean(process.env.SUPABASE_SERVICE_KEY),
        },
        version: '1.0.0',
        environment: process.env.NODE_ENV ?? 'unknown',
    });
});
//# sourceMappingURL=health.router.js.map