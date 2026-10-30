// Health check router
import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'connected';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'disconnected';
    dbError = err instanceof Error ? err.message : String(err);
  }

  let dbTarget = 'not_configured';
  if (process.env.DATABASE_URL) {
    try {
      const u = new URL(process.env.DATABASE_URL);
      dbTarget = `${u.protocol}//${u.host}${u.pathname}`;
    } catch {
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
