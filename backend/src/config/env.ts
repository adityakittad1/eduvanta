import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  // Provide dummy defaults for test environment to avoid missing env errors
  DATABASE_URL: z.string().default('postgresql://user:pass@localhost:5432/testdb'),
  JWT_ACCESS_SECRET: z.string().default('test_secret_access_which_is_long_enough_123456'),
  JWT_REFRESH_SECRET: z.string().default('test_secret_refresh_which_is_long_enough_123456'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  FILE_UPLOAD_DIR: z.string().default('./uploads'),
  FILE_UPLOAD_MAX_SIZE_MB: z.coerce.number().default(50),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  // AI (optional until Phase 14)
  AI_PROVIDER: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  // Supabase (for storage)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  // Root domain for subdomain tenant resolution
  ROOT_DOMAIN: z.string().default('localhost'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
