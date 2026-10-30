"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
// Health check router
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const supabase_1 = require("../../lib/supabase");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', async (_req, res) => {
    let dbStatus = 'disconnected';
    let dbProvider = 'none';
    let dbError = null;
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        dbStatus = 'connected';
        dbProvider = 'prisma';
    }
    catch (err) {
        dbError = err instanceof Error ? err.message : String(err);
        if (supabase_1.supabase) {
            try {
                const { data } = await supabase_1.supabase.from('schools').select('id').limit(1);
                if (data) {
                    dbStatus = 'connected';
                    dbProvider = 'supabase-rest';
                }
            }
            catch (sbErr) {
                // Both failed
            }
        }
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
            provider: dbProvider,
            target: dbTarget,
            error: dbStatus === 'connected' ? null : dbError,
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
exports.healthRouter.get('/auth-diag', async (_req, res) => {
    const diag = {};
    try {
        const { findUserForLogin } = await Promise.resolve().then(() => __importStar(require('../../lib/authDb')));
        const uAdmin = await findUserForLogin('admin@zpschoolerp.com');
        diag.superAdmin = {
            found: Boolean(uAdmin),
            role: uAdmin?.role,
            schoolId: uAdmin?.schoolId,
            isActive: uAdmin?.isActive,
            hasHash: Boolean(uAdmin?.passwordHash),
        };
        const uPrincipal = await findUserForLogin('shinde@gmail.com');
        diag.principal = {
            found: Boolean(uPrincipal),
            role: uPrincipal?.role,
            schoolId: uPrincipal?.schoolId,
            schoolName: uPrincipal?.school?.name,
            schoolSlug: uPrincipal?.school?.slug,
            isActive: uPrincipal?.isActive,
        };
        res.json({ success: true, diag });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err?.message, diag });
    }
});
//# sourceMappingURL=health.router.js.map