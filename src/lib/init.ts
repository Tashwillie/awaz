import { validateEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { registerProviders } from '@/services/providers/voice/register';
import { startExpiryJob } from '@/jobs/expire-demos.job';

validateEnv();
registerProviders();

if (process.env.NODE_ENV === 'development') {
  startExpiryJob();
  logger.info('Development mode: Expiry job started');
}







