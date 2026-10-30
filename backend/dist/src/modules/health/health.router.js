"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
// Health check router
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', async (_req, res) => {
    let dbStatus = 'connected';
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
    }
    catch {
        dbStatus = 'disconnected';
    }
    const healthy = dbStatus === 'connected';
    res.status(200).json({
        success: true,
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        version: '1.0.0',
        environment: process.env.NODE_ENV ?? 'unknown',
    });
});
//# sourceMappingURL=health.router.js.map