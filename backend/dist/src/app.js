"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const tenantResolver_1 = require("./middleware/tenantResolver");
const requireTenant_1 = require("./middleware/requireTenant");
const logger_1 = require("./lib/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Route imports (added as phases progress)
const health_router_1 = require("./modules/health/health.router");
const auth_router_1 = require("./modules/auth/auth.router");
const schools_router_1 = require("./modules/schools/schools.router");
const users_router_1 = require("./modules/users/users.router");
const profile_router_1 = require("./modules/profile/profile.router");
const students_router_1 = require("./modules/students/students.router");
const teachers_router_1 = require("./modules/teachers/teachers.router");
const classes_router_1 = require("./modules/classes/classes.router");
const attendance_router_1 = require("./modules/attendance/attendance.router");
const academics_router_1 = require("./modules/academics/academics.router");
const early_warning_router_1 = require("./modules/early-warning/early-warning.router");
const quizzes_router_1 = require("./modules/quizzes/quizzes.router");
const notices_router_1 = require("./modules/notices/notices.router");
const resources_router_1 = require("./modules/resources/resources.router");
const tc_router_1 = require("./modules/tc/tc.router");
const tc_template_router_1 = __importDefault(require("./modules/tc-template/tc-template.router"));
const gallery_router_1 = require("./modules/gallery/gallery.router");
const school_profile_router_1 = require("./modules/school-profile/school-profile.router");
const ai_router_1 = require("./modules/ai/ai.router");
const reports_router_1 = require("./modules/reports/reports.router");
const public_router_1 = require("./modules/public/public.router");
const upload_router_1 = require("./modules/upload/upload.router");
function createApp() {
    const app = (0, express_1.default)();
    // ─── Security ───────────────────────────────────────────
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded files
    }));
    // ─── CORS ────────────────────────────────────────────────
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests) if needed, 
            // but typically browsers will send origin.
            if (!origin)
                return callback(null, true);
            const rootDomain = env_1.env.ROOT_DOMAIN === 'localhost' ? 'localhost' : env_1.env.ROOT_DOMAIN;
            const allowedOrigins = [env_1.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'];
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Allow any subdomain of ROOT_DOMAIN, optionally with a port
            const urlPattern = new RegExp(`^https?:\\/\\/[a-zA-Z0-9-]+\\.${rootDomain}(:\\d+)?$`);
            if (urlPattern.test(origin) ||
                origin === `https://${rootDomain}` ||
                origin === `http://${rootDomain}` ||
                origin.endsWith('.vercel.app') ||
                origin.endsWith('.vercel.sh')) {
                return callback(null, true);
            }
            callback(new errorHandler_1.AppError(`CORS policy restricts access from origin: ${origin}`, 403, 'CORS_ERROR'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug', 'x-tenant-slug'],
    }));
    // ─── Body Parsers ────────────────────────────────────────
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)());
    // ─── Request Logging ─────────────────────────────────────
    app.use((req, _res, next) => {
        logger_1.logger.info(`${req.method} ${req.path}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });
        next();
    });
    // ─── Static File Serving (uploads) ───────────────────────
    app.use('/uploads', express_1.default.static(path_1.default.resolve(env_1.env.FILE_UPLOAD_DIR), {
        dotfiles: 'deny',
    }));
    // ─── Direct Health & Ping Endpoints ─────────────────────
    // Mounted before tenantResolver so platform health probes never incur tenant or DB overhead
    app.get(['/health', '/api/health'], (_req, res) => res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() }));
    app.get(['/', '/api'], (_req, res) => res.json({ status: 'ok', message: 'EduVanta ERP API', timestamp: new Date().toISOString() }));
    // ─── Tenant resolution (subdomain) ───────────────────────
    app.use(tenantResolver_1.tenantResolver);
    // requireTenant is applied explicitly to routes that need it, not globally.
    // ─── API Routes (Supports both /api/v1 and /v1 for Vercel Services prefixing) ──
    const apiPrefixes = ['/api/v1', '/v1'];
    for (const prefix of apiPrefixes) {
        app.use(`${prefix}/health`, health_router_1.healthRouter);
        app.use(`${prefix}/auth`, auth_router_1.authRouter); // auth.controller handles its own tenant requirements
        app.use(`${prefix}/schools`, schools_router_1.schoolsRouter); // SuperAdmin route, handled inside
        app.use(`${prefix}/users`, requireTenant_1.requireTenant, users_router_1.usersRouter);
        app.use(`${prefix}/profile`, requireTenant_1.requireTenant, profile_router_1.profileRouter);
        app.use(`${prefix}/students`, requireTenant_1.requireTenant, students_router_1.studentsRouter);
        app.use(`${prefix}/teachers`, requireTenant_1.requireTenant, teachers_router_1.teachersRouter);
        app.use(`${prefix}/classes`, requireTenant_1.requireTenant, classes_router_1.classesRouter);
        app.use(`${prefix}/attendance`, requireTenant_1.requireTenant, attendance_router_1.attendanceRouter);
        app.use(`${prefix}/academics`, requireTenant_1.requireTenant, academics_router_1.academicsRouter);
        app.use(`${prefix}/early-warning`, requireTenant_1.requireTenant, early_warning_router_1.earlyWarningRouter);
        app.use(`${prefix}/quizzes`, requireTenant_1.requireTenant, quizzes_router_1.quizzesRouter);
        app.use(`${prefix}/notices`, requireTenant_1.requireTenant, notices_router_1.noticesRouter);
        app.use(`${prefix}/resources`, requireTenant_1.requireTenant, resources_router_1.resourcesRouter);
        app.use(`${prefix}/tc`, requireTenant_1.requireTenant, tc_router_1.tcRouter);
        app.use(`${prefix}/tc-templates`, requireTenant_1.requireTenant, tc_template_router_1.default);
        app.use(`${prefix}/gallery`, requireTenant_1.requireTenant, gallery_router_1.galleryRouter);
        app.use(`${prefix}/school-profile`, requireTenant_1.requireTenant, school_profile_router_1.schoolProfileRouter);
        app.use(`${prefix}/ai`, requireTenant_1.requireTenant, ai_router_1.aiRouter);
        app.use(`${prefix}/reports`, requireTenant_1.requireTenant, reports_router_1.reportsRouter);
        app.use(`${prefix}/upload`, upload_router_1.uploadRouter);
        app.use(`${prefix}/public`, public_router_1.publicRouter); // publicRouter handles its own logic
    }
    // ─── 404 & Error Handling ────────────────────────────────
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    return app;
}
exports.createApp = createApp;
const defaultApp = createApp();
exports.default = defaultApp;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = defaultApp;
    module.exports.default = defaultApp;
    module.exports.createApp = createApp;
}
//# sourceMappingURL=app.js.map