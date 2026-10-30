"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const cleanUrl = (val) => {
    if (!val || typeof val !== 'string' || val.trim() === '')
        return undefined;
    const trimmed = val.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
};
const emptyToUndefined = (val) => {
    if (typeof val === 'string' && val.trim() === '')
        return undefined;
    return val;
};
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default('postgresql://user:pass@localhost:5432/testdb')),
    JWT_ACCESS_SECRET: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default('test_secret_access_which_is_long_enough_123456')),
    JWT_REFRESH_SECRET: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default('test_secret_refresh_which_is_long_enough_123456')),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default('15m')),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default('7d')),
    FRONTEND_URL: zod_1.z.preprocess(cleanUrl, zod_1.z.string().url().default('http://localhost:5173')),
    FILE_UPLOAD_DIR: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
        ? '/tmp/uploads'
        : './uploads')),
    FILE_UPLOAD_MAX_SIZE_MB: zod_1.z.coerce.number().default(50),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    // AI
    AI_PROVIDER: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().optional()),
    AI_API_KEY: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().optional()),
    AI_MODEL: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().optional()),
    // Supabase
    SUPABASE_URL: zod_1.z.preprocess(cleanUrl, zod_1.z.string().url().optional()),
    SUPABASE_SERVICE_KEY: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().optional()),
    // Root domain
    ROOT_DOMAIN: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().default('localhost')),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Environment validation warnings:', parsed.error.flatten().fieldErrors);
}
// Fallback safely to defaults instead of process.exit(1) so serverless functions never crash on boot
exports.env = parsed.success ? parsed.data : envSchema.parse({});
//# sourceMappingURL=env.js.map