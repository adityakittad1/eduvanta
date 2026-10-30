// Health check router
import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let dbProvider = 'none';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbProvider = 'prisma';
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
    if (supabase) {
      try {
        const { data } = await supabase.from('schools').select('id').limit(1);
        if (data) {
          dbStatus = 'connected';
          dbProvider = 'supabase-rest';
        }
      } catch (sbErr: any) {
        // Both failed
      }
    }
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

healthRouter.get('/auth-diag', async (_req: Request, res: Response) => {
  const diag: Record<string, any> = {};
  try {
    const { findUserForLogin } = await import('../../lib/authDb');
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message, diag });
  }
});
