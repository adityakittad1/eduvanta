// Health check router
import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'connected';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'disconnected';
  }

  const healthy = dbStatus === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
    environment: process.env.NODE_ENV ?? 'unknown',
  });
});
