import 'dotenv/config';
import { env } from './src/config/env';
import { logger } from './src/lib/logger';
import { prisma } from './src/lib/prisma';
import { createApp } from './src/app';

const PORT = env.PORT;

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
  }

  const app = createApp();

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

main().catch((error) => {
  logger.error('Fatal error during startup', { error });
  process.exit(1);
});
