import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { BadRequestError } from '@/lib/errors';

const prisma = new PrismaClient();

const startSchema = z.object({
  placeId: z.string().optional(),
  query: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  try {
    const body = await request.json();
    const validatedBody = startSchema.parse(body);
    
    requestLogger.info('Demo start requested', { placeId: validatedBody.placeId });
    
    const env = getEnv();
    const ttlExpiresAt = new Date();
    ttlExpiresAt.setHours(ttlExpiresAt.getHours() + env.DEMO_TTL_HOURS);
    
    const demoSession = await prisma.demoSession.create({
      data: {
        status: 'DRAFT',
        ttlExpiresAt,
        provider: env.VOICE_PROVIDER,
        requestId,
      },
    });
    
    return NextResponse.json({
      id: demoSession.id,
      status: demoSession.status,
      provider: demoSession.provider,
      createdAt: demoSession.createdAt.toISOString(),
      ttlExpiresAt: demoSession.ttlExpiresAt.toISOString(),
      requestId,
    });
  } catch (error) {
    requestLogger.error('Demo start failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    if (error instanceof BadRequestError) {
      return NextResponse.json(
        { error: error.message, requestId },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  }
}







