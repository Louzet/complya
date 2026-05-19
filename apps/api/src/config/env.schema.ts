import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  API_URL: z.string().url(),
  CORS_ORIGINS: z
    .string()
    .transform((val: string) => val.split(',').map((s: string) => s.trim())),

  // Base de données
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  DATABASE_URL_UNPOOLED: z.string().min(1, 'DATABASE_URL_UNPOOLED est requis'),

  // Auth Clerk
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY est requis'),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_JWT_KEY: z.string().optional(),

  // Stockage R2
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID est requis'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID est requis'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY est requis'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME est requis'),
  R2_ENDPOINT: z.string().url('R2_ENDPOINT doit être une URL valide'),
  R2_PUBLIC_URL: z.string().url().optional(),
  SIGNED_URL_EXPIRY_SECONDS: z.coerce.number().default(900),

  // Trigger.dev
  TRIGGER_SECRET_KEY: z.string().min(1, 'TRIGGER_SECRET_KEY est requis'),
  TRIGGER_API_URL: z.string().url().default('https://api.trigger.dev'),

  // Email (optionnel en dev)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Rate limiting
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),

  // Logs
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SENTRY_DSN: z.string().transform((v) => v || undefined).pipe(z.string().url().optional()),
});

export type EnvConfig = z.infer<typeof envSchema>;
