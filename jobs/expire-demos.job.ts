import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function expireDemos(): Promise<void> {
  logger.info('Starting demo expiry job');
  
  try {
    const now = new Date();
    
    const expiredSessions = await prisma.demoSession.findMany({
      where: {
        ttlExpiresAt: {
          lt: now,
        },
        status: {
          not: 'EXPIRED',
        },
      },
    });
    
    if (expiredSessions.length === 0) {
      logger.info('No expired sessions found');
      return;
    }
    
    logger.info(`Found ${expiredSessions.length} expired sessions`);
    
    await prisma.demoSession.updateMany({
      where: {
        id: {
          in: expiredSessions.map(s => s.id),
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });
    
    logger.info(`Marked ${expiredSessions.length} sessions as expired`);
  } catch (error) {
    logger.error('Demo expiry job failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export function startExpiryJob(): void {
  logger.info('Starting expiry job scheduler');
  
  cron.schedule('0 * * * *', async () => {
    await expireDemos();
  }, {
    scheduled: true,
    timezone: 'UTC',
  });
  
  logger.info('Expiry job scheduled to run hourly');
}

if (require.main === module) {
  expireDemos()
    .then(() => {
      logger.info('Expiry job completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Expiry job failed', { error: error.message });
      process.exit(1);
    });
}







