import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import packageJson from '../../../package.json';

export async function GET() {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  requestLogger.info('Health check requested');
  
  return NextResponse.json({
    ok: true,
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    requestId,
  });
}
