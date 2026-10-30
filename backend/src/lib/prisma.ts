import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    try {
      const client = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ],
      });

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client as any).$on('query', (e: { query: string; duration: number }) => {
          if (e.duration > 500) {
            logger.warn('Slow query detected', {
              query: e.query,
              duration: `${e.duration}ms`,
            });
          }
        });
      }

      globalForPrisma.prisma = client;
    } catch (err) {
      logger.error('Failed to initialize PrismaClient', { error: err });
      throw err;
    }
  }
  return globalForPrisma.prisma;
}

// Lazy Proxy: Defer PrismaClient instantiation until first actual query.
// This prevents serverless module boot crashes if DB connection or binary is initializing.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

