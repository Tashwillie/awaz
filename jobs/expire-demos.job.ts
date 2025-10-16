import cron from 'node-cron';
import { logger } from '@/lib/logger';

// Lazily create Prisma client only when functions run at runtime
let prismaSingleton: any | null = null;
async function getPrisma() {
  if (!prismaSingleton) {
    const { PrismaClient } = await import('@prisma/client');
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton as import('@prisma/client').PrismaClient;
}

export async function expireDemos(): Promise<void> {
  logger.info('Starting demo expiry job');
  
  try {
    const prisma = await getPrisma();
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







