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
  AWAZ_WEBHOOK_SECRET: z.string().optional(),
  AWAZ_AGENT_ID: z.string().optional(),
  
  // Twilio Configuration
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  CRM: z.enum(['hubspot', 'pipedrive']).default('hubspot'),
  HUBSPOT_API_KEY: z.string().optional(),
  PIPEDRIVE_API_TOKEN: z.string().optional(),
  
  CALENDAR: z.enum(['google', 'calendly']).default('google'),
  GOOGLE_CALENDAR_CREDENTIALS_BASE64: z.string().optional(),
  CALENDLY_TOKEN: z.string().optional(),
  
  SLACK_WEBHOOK_URL: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url().optional()),
  DEMO_TTL_HOURS: z.coerce.number().default(24),
  
  DATABASE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (!env) {
    // During Vercel build, avoid throwing on missing env; return minimal defaults
    if (process.env.VERCEL === '1') {
      try {
        env = envSchema.parse(process.env);
      } catch (error) {
        logger.warn('Skipping strict env validation during Vercel build');
        env = {
          NODE_ENV: (process.env.NODE_ENV as any) || 'production',
          LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
          TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
          GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
          VOICE_PROVIDER: (process.env.VOICE_PROVIDER as any) || 'retell',
          RETELL_API_KEY: process.env.RETELL_API_KEY,
          RETELL_WEBHOOK_SECRET: process.env.RETELL_WEBHOOK_SECRET,
          VAPI_API_KEY: process.env.VAPI_API_KEY,
          VAPI_WEBHOOK_SECRET: process.env.VAPI_WEBHOOK_SECRET,
          AWAZ_API_KEY: process.env.AWAZ_API_KEY,
          AWAZ_WEBHOOK_SECRET: process.env.AWAZ_WEBHOOK_SECRET,
          AWAZ_AGENT_ID: process.env.AWAZ_AGENT_ID,
          TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
          TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
          TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
          CRM: (process.env.CRM as any) || 'hubspot',
          HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
          PIPEDRIVE_API_TOKEN: process.env.PIPEDRIVE_API_TOKEN,
          CALENDAR: (process.env.CALENDAR as any) || 'google',
          GOOGLE_CALENDAR_CREDENTIALS_BASE64: process.env.GOOGLE_CALENDAR_CREDENTIALS_BASE64,
          CALENDLY_TOKEN: process.env.CALENDLY_TOKEN,
          SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
          DEMO_TTL_HOURS: Number(process.env.DEMO_TTL_HOURS || 24),
          DATABASE_URL: process.env.DATABASE_URL,
        } as Env;
      }
    } else {
      env = envSchema.parse(process.env);
    }
    
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
