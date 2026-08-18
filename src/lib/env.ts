import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('FinTrace'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.1.0'),
  DATABASE_URL: z.string().default('postgresql://fintrace_user:fintrace_secure_password_2026@localhost:5432/fintrace_db?schema=public'),
  AUTH_SECRET: z.string().default('sih-prototype-secret-key-2026'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  AI_RISK_MODEL_VERSION: z.string().default('v1.0.0-sih-prototype'),
  RISK_HIGH_THRESHOLD: z.coerce.number().default(75),
  RISK_MEDIUM_THRESHOLD: z.coerce.number().default(45),
});

export const env = envSchema.parse(process.env);
