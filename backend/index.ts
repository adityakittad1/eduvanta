import 'dotenv/config';
import { env } from './src/config/env';
import { logger } from './src/lib/logger';
import { prisma } from './src/lib/prisma';
import { createApp } from './src/app';

const PORT = env.PORT;
const app = createApp();

// Export app instance for serverless runtime (Vercel Express Service)
// Support both CommonJS (module.exports = app) and ESM (exports.default = app)
export default app;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.warn('Initial database connection failed — queries will connect on demand', { error });
  }

  const server = app.listen(PORT, () => {
    logger.info(`ZP School ERP API running on port ${PORT}`, {
      environment: env.NODE_ENV,
      port: PORT,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server and database connections closed.');
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
const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.VERCEL_ENV) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT) ||
  Boolean(process.env.NOW_REGION) ||
  !isDirectExecution;

if (isDirectExecution && !isServerless) {
  main().catch((error) => {
    logger.error('Fatal error during startup', { error });
    process.exit(1);
  });
}

