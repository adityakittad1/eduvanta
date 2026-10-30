"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./src/config/env");
const logger_1 = require("./src/lib/logger");
const prisma_1 = require("./src/lib/prisma");
const app_1 = require("./src/app");
const PORT = env_1.env.PORT;
const app = (0, app_1.createApp)();
// Export app instance for serverless runtime (Vercel Express Service)
// Support both CommonJS (module.exports = app) and ESM (exports.default = app)
exports.default = app;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
    module.exports.default = app;
}
async function main() {
    // Verify database connection
    try {
        await prisma_1.prisma.$connect();
        logger_1.logger.info('Database connected successfully');
    }
    catch (error) {
        logger_1.logger.warn('Initial database connection failed — queries will connect on demand', { error });
    }
    const server = app.listen(PORT, () => {
        logger_1.logger.info(`ZP School ERP API running on port ${PORT}`, {
            environment: env_1.env.NODE_ENV,
            port: PORT,
        });
    });
    // Graceful shutdown
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await prisma_1.prisma.$disconnect();
            logger_1.logger.info('Server and database connections closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
// Only start standalone server if executed directly (e.g. node index.js or tsx index.ts).
// When imported by Vercel serverless functions, require.main !== module and isServerless is true,
// so main() is never invoked and the app is handled cleanly by Vercel's serverless wrapper.
const isDirectExecution = typeof require !== 'undefined' && require.main === module;
const isServerless = Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT) ||
    Boolean(process.env.NOW_REGION) ||
    !isDirectExecution;
if (isDirectExecution && !isServerless) {
    main().catch((error) => {
        logger_1.logger.error('Fatal error during startup', { error });
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map