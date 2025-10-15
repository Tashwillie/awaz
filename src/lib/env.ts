import { z } from 'zod';
import { logger } from './logger';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  TURNSTILE_SECRET: z.string().optional(),
  
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  
  VOICE_PROVIDER: z.enum(['retell', 'vapi', 'awaz']).default('retell'),
  RETELL_API_KEY: z.string().optional(),
  RETELL_WEBHOOK_SECRET: z.string().optional(),
  VAPI_API_KEY: z.string().optional(),
  VAPI_WEBHOOK_SECRET: z.string().optional(),
  AWAZ_API_KEY: z.string().optional(),
  
  CRM: z.enum(['hubspot', 'pipedrive']).default('hubspot'),
  HUBSPOT_API_KEY: z.string().optional(),
  PIPEDRIVE_API_TOKEN: z.string().optional(),
  
  CALENDAR: z.enum(['google', 'calendly']).default('google'),
  GOOGLE_CALENDAR_CREDENTIALS_BASE64: z.string().optional(),
  CALENDLY_TOKEN: z.string().optional(),
  
  SLACK_WEBHOOK_URL: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url().optional()),
  DEMO_TTL_HOURS: z.coerce.number().default(24),
  
  DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (!env) {
    env = envSchema.parse(process.env);
    
    if (env.NODE_ENV === 'development' && !env.TURNSTILE_SECRET) {
      logger.warn('TURNSTILE_SECRET not set - Turnstile verification will be disabled in development');
    }
  }
  return env;
}

export function validateEnv(): void {
  try {
    getEnv();
    logger.info('Environment validation successful');
  } catch (error) {
    logger.error('Environment validation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}
