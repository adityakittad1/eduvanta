import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import cookieParser from 'cookie-parser';
import { tenantResolver } from './middleware/tenantResolver';
import { requireTenant } from './middleware/requireTenant';
import { logger } from './lib/logger';
import { errorHandler, AppError } from './middleware/errorHandler';
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
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) if needed, 
      // but typically browsers will send origin.
      if (!origin) return callback(null, true);
      
      const rootDomain = env.ROOT_DOMAIN === 'localhost' ? 'localhost' : env.ROOT_DOMAIN;
      const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow any subdomain of ROOT_DOMAIN, optionally with a port
      const urlPattern = new RegExp(`^https?:\\/\\/[a-zA-Z0-9-]+\\.${rootDomain}(:\\d+)?$`);
      if (
        urlPattern.test(origin) || 
        origin === `https://${rootDomain}` || 
        origin === `http://${rootDomain}` ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.vercel.sh')
      ) {
        return callback(null, true);
      }
      
      callback(new AppError(`CORS policy restricts access from origin: ${origin}`, 403, 'CORS_ERROR'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug', 'x-tenant-slug'],
  }));

  // ─── Body Parsers ────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

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

  // ─── Direct Health & Ping Endpoints ─────────────────────
  // Mounted before tenantResolver so platform health probes never incur tenant or DB overhead
  app.get(['/health', '/api/health'], (_req, res) => res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() }));
  app.get(['/', '/api'], (_req, res) => res.json({ status: 'ok', message: 'EduVanta ERP API', timestamp: new Date().toISOString() }));

  // ─── Tenant resolution (subdomain) ───────────────────────
  app.use(tenantResolver);
  // requireTenant is applied explicitly to routes that need it, not globally.

  // ─── API Routes (Supports both /api/v1 and /v1 for Vercel Services prefixing) ──
  const apiPrefixes = ['/api/v1', '/v1'];
  for (const prefix of apiPrefixes) {
    app.use(`${prefix}/health`, healthRouter);
    app.use(`${prefix}/auth`, authRouter); // auth.controller handles its own tenant requirements
    app.use(`${prefix}/schools`, schoolsRouter); // SuperAdmin route, handled inside
    app.use(`${prefix}/users`, requireTenant, usersRouter);
    app.use(`${prefix}/profile`, requireTenant, profileRouter);
    app.use(`${prefix}/students`, requireTenant, studentsRouter);
    app.use(`${prefix}/teachers`, requireTenant, teachersRouter);
    app.use(`${prefix}/classes`, requireTenant, classesRouter);
    app.use(`${prefix}/attendance`, requireTenant, attendanceRouter);
    app.use(`${prefix}/academics`, requireTenant, academicsRouter);
    app.use(`${prefix}/early-warning`, requireTenant, earlyWarningRouter);
    app.use(`${prefix}/quizzes`, requireTenant, quizzesRouter);
    app.use(`${prefix}/notices`, requireTenant, noticesRouter);
    app.use(`${prefix}/resources`, requireTenant, resourcesRouter);
    app.use(`${prefix}/tc`, requireTenant, tcRouter);
    app.use(`${prefix}/tc-templates`, requireTenant, tcTemplateRouter);
    app.use(`${prefix}/gallery`, requireTenant, galleryRouter);
    app.use(`${prefix}/school-profile`, requireTenant, schoolProfileRouter);
    app.use(`${prefix}/ai`, requireTenant, aiRouter);
    app.use(`${prefix}/reports`, requireTenant, reportsRouter);
    app.use(`${prefix}/upload`, uploadRouter);
    app.use(`${prefix}/public`, publicRouter); // publicRouter handles its own logic
  }

  // ─── 404 & Error Handling ────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const defaultApp = createApp();
export default defaultApp;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = defaultApp;
  module.exports.default = defaultApp;
  module.exports.createApp = createApp;
}

