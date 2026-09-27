import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { tenantResolver } from './middleware/tenantResolver';
import { requireTenant } from './middleware/requireTenant';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';


// Route imports (added as phases progress)
import { healthRouter } from './modules/health/health.router';
import { authRouter } from './modules/auth/auth.router';
import { schoolsRouter } from './modules/schools/schools.router';
import { usersRouter } from './modules/users/users.router';
import { profileRouter } from './modules/profile/profile.router';
import { studentsRouter } from './modules/students/students.router';
import { teachersRouter } from './modules/teachers/teachers.router';
import { classesRouter } from './modules/classes/classes.router';
import { attendanceRouter } from './modules/attendance/attendance.router';
import { academicsRouter } from './modules/academics/academics.router';
import { earlyWarningRouter } from './modules/early-warning/early-warning.router';
import { quizzesRouter } from './modules/quizzes/quizzes.router';
import { noticesRouter } from './modules/notices/notices.router';
import { resourcesRouter } from './modules/resources/resources.router';
import { tcRouter } from './modules/tc/tc.router';
import tcTemplateRouter from './modules/tc-template/tc-template.router';
import { galleryRouter } from './modules/gallery/gallery.router';
import { schoolProfileRouter } from './modules/school-profile/school-profile.router';
import { aiRouter } from './modules/ai/ai.router';
import { reportsRouter } from './modules/reports/reports.router';
import { publicRouter } from './modules/public/public.router';
import { uploadRouter } from './modules/upload/upload.router';

export function createApp(): Application {
  const app = express();

  // ─── Security ───────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded files
  }));

  // ─── CORS ────────────────────────────────────────────────
  app.use(cors({
    origin: env.NODE_ENV === 'production'
      ? [env.FRONTEND_URL]
      : ['http://localhost:5173', 'http://localhost:3000', env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ─── Body Parsers ────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Request Logging ─────────────────────────────────────
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    next();
  });

  // ─── Static File Serving (uploads) ───────────────────────
  app.use(
    '/uploads',
    express.static(path.resolve(env.FILE_UPLOAD_DIR), {
      dotfiles: 'deny',
  })
);

  // ─── Tenant resolution (subdomain) ───────────────────────
  app.use(tenantResolver);
  // requireTenant is applied explicitly to routes that need it, not globally.

  // ─── API Routes ──────────────────────────────────────────
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter); // auth.controller handles its own tenant requirements
  app.use('/api/v1/schools', schoolsRouter); // SuperAdmin route, handled inside
  app.use('/api/v1/users', requireTenant, usersRouter);
  app.use('/api/v1/profile', requireTenant, profileRouter);
  app.use('/api/v1/students', requireTenant, studentsRouter);
  app.use('/api/v1/teachers', requireTenant, teachersRouter);
  app.use('/api/v1/classes', requireTenant, classesRouter);
  app.use('/api/v1/attendance', requireTenant, attendanceRouter);
  app.use('/api/v1/academics', requireTenant, academicsRouter);
  app.use('/api/v1/early-warning', requireTenant, earlyWarningRouter);
  app.use('/api/v1/quizzes', requireTenant, quizzesRouter);
  app.use('/api/v1/notices', requireTenant, noticesRouter);
  app.use('/api/v1/resources', requireTenant, resourcesRouter);
  app.use('/api/v1/tc', requireTenant, tcRouter);
  app.use('/api/v1/tc-templates', requireTenant, tcTemplateRouter);
  app.use('/api/v1/gallery', requireTenant, galleryRouter);
  app.use('/api/v1/school-profile', requireTenant, schoolProfileRouter);
  app.use('/api/v1/ai', requireTenant, aiRouter);
  app.use('/api/v1/reports', requireTenant, reportsRouter);
  app.use('/api/v1/upload', uploadRouter);
  // Public website API — no authentication required
  app.use('/api/v1/public', publicRouter); // publicRouter handles its own logic

  // ─── 404 & Error Handling ────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
