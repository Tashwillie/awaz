import { validateEnv, getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { registerProviders } from '@/services/providers/voice/register';
import { startExpiryJob } from '@/jobs/expire-demos.job';

// Only validate environment if we're not in build mode
if (process.env.VERCEL !== '1') {
  try {
    validateEnv();
  } catch (error) {
    logger.warn('Environment validation skipped during build', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

registerProviders();

if (process.env.NODE_ENV === 'development') {
  startExpiryJob();
  logger.info('Development mode: Expiry job started');
}







