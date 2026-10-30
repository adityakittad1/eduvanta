import { z } from 'zod';

const cleanUrl = (val: unknown) => {
  if (!val || typeof val !== 'string' || val.trim() === '') return undefined;
  const trimmed = val.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
};

const emptyToUndefined = (val: unknown) => {
  if (typeof val === 'string' && val.trim() === '') return undefined;
  return val;
};

const cleanTimespan = (defaultVal: string) => (val: unknown) => {
  if (!val || typeof val !== 'string') return defaultVal;
  const cleaned = val.replace(/^['"]|['"]$/g, '').trim();
  return cleaned || defaultVal;
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().default('postgresql://user:pass@localhost:5432/testdb')),
  JWT_ACCESS_SECRET: z.preprocess(emptyToUndefined, z.string().default('test_secret_access_which_is_long_enough_123456')),
  JWT_REFRESH_SECRET: z.preprocess(emptyToUndefined, z.string().default('test_secret_refresh_which_is_long_enough_123456')),
  JWT_ACCESS_EXPIRES_IN: z.preprocess(cleanTimespan('15m'), z.string().default('15m')),
  JWT_REFRESH_EXPIRES_IN: z.preprocess(cleanTimespan('7d'), z.string().default('7d')),
  FRONTEND_URL: z.preprocess(cleanUrl, z.string().url().default('http://localhost:5173')),
  FILE_UPLOAD_DIR: z.preprocess(
    emptyToUndefined,
    z.string().default(
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
        ? '/tmp/uploads'
        : './uploads'
    )
  ),
  FILE_UPLOAD_MAX_SIZE_MB: z.coerce.number().default(50),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  // AI
  AI_PROVIDER: z.preprocess(emptyToUndefined, z.string().optional()),
  AI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  AI_MODEL: z.preprocess(emptyToUndefined, z.string().optional()),
  // Supabase
  SUPABASE_URL: z.preprocess(cleanUrl, z.string().url().optional()),
  SUPABASE_SERVICE_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  // Root domain
  ROOT_DOMAIN: z.preprocess(emptyToUndefined, z.string().default('localhost')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation warnings:', parsed.error.flatten().fieldErrors);
}

// Fallback safely to defaults instead of process.exit(1) so serverless functions never crash on boot
export const env = parsed.success ? parsed.data : (envSchema.parse({}) as z.infer<typeof envSchema>);
export type Env = typeof env;
