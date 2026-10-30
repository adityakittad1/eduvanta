"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.getPrismaClient = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const globalForPrisma = globalThis;
function getPrismaClient() {
    if (!globalForPrisma.prisma) {
        try {
            const client = new client_1.PrismaClient({
                log: [
                    { level: 'query', emit: 'event' },
                    { level: 'error', emit: 'stdout' },
                    { level: 'warn', emit: 'stdout' },
                ],
            });
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                client.$on('query', (e) => {
                    if (e.duration > 500) {
                        logger_1.logger.warn('Slow query detected', {
                            query: e.query,
                            duration: `${e.duration}ms`,
                        });
                    }
                });
            }
            globalForPrisma.prisma = client;
        }
        catch (err) {
            logger_1.logger.error('Failed to initialize PrismaClient', { error: err });
            throw err;
        }
    }
    return globalForPrisma.prisma;
}
exports.getPrismaClient = getPrismaClient;
// Lazy Proxy: Defer PrismaClient instantiation until first actual query.
// This prevents serverless module boot crashes if DB connection or binary is initializing.
exports.prisma = new Proxy({}, {
    get(_target, prop, receiver) {
        const client = getPrismaClient();
        const value = Reflect.get(client, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    },
});
//# sourceMappingURL=prisma.js.map