import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
// Avoid importing package.json at build-time via ESM; instead inline version or use env
const version = process.env.npm_package_version || '0.1.0';

export async function GET() {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  requestLogger.info('Health check requested');
  
  return NextResponse.json({
    ok: true,
    version,
    timestamp: new Date().toISOString(),
    requestId,
  });
}
