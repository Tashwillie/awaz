import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
let prismaSingleton: any | null = null;
async function getPrisma() {
  if (!prismaSingleton) {
    const { PrismaClient } = await import('@prisma/client');
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton as import('@prisma/client').PrismaClient;
}
import { getActiveProvider } from '@/services/providers/voice/register';
import { logger } from '@/lib/logger';
import { BadRequestError } from '@/lib/errors';
import { getEnv } from '@/lib/env';


const receiveCallSchema: z.ZodType = z.object({
  sessionId: z.string(),
  phone_e164: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid E164 format'),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  let validatedBody: any = null;
  
  try {
    const body = await request.json();
    validatedBody = receiveCallSchema.parse(body);
    
    requestLogger.info('Demo receive-call requested', { 
      sessionId: validatedBody.sessionId,
      phoneE164: validatedBody.phone_e164
    });
    
    // Verify Turnstile token (skip in test mode)
    const env = getEnv();
    const turnstileToken = request.headers.get('x-turnstile-token');
    
    if (env.NODE_ENV !== 'test') {
      if (!turnstileToken || !env.TURNSTILE_SECRET) {
        return NextResponse.json(
          { error: 'Turnstile verification required', requestId },
          { status: 401 }
        );
      }
      // TODO: Implement Turnstile verification
    } else {
      requestLogger.warn('Skipping Turnstile verification in test mode');
    }
    
    // Find the demo session and business profile
    const session = await prisma.demoSession.findUnique({
      where: { id: validatedBody.sessionId },
      include: {
        businessProfile: true,
        lead: true
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Demo session not found', requestId },
        { status: 404 }
      );
    }

    if (!session.businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found for session', requestId },
        { status: 400 }
      );
    }

    // Start the voice call
    const voiceProvider = getActiveProvider();
    const providerCallId = await voiceProvider.startCall(
      validatedBody.sessionId,
      validatedBody.phone_e164,
      session.businessProfile.json
    );

    // Create call record in database
    const call = await prisma.call.create({
      data: {
        demoSessionId: validatedBody.sessionId,
        provider: env.VOICE_PROVIDER,
        providerCallId,
        toPhoneE164: validatedBody.phone_e164,
        fromPhoneE164: '+1234567890', // TODO: Use real business phone
        status: 'INITIATED',
      }
    });

    requestLogger.info('Call initiated successfully', {
      callId: call.id,
      providerCallId,
      sessionId: validatedBody.sessionId
    });

    return NextResponse.json({
      callId: call.id,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Demo receive-call failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: validatedBody?.sessionId
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          requestId 
        },
        { status: 400 }
      );
    }
    
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