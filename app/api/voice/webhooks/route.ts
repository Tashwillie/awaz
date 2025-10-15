import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getActiveProvider } from '@/services/providers/voice/register';
import { logger } from '@/lib/logger';
import { ProviderError } from '@/lib/errors';
import { ProviderEventSchema } from '@/types/webhook';
import { getEnv } from '@/lib/env';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  try {
    const env = getEnv();
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    requestLogger.info('Voice webhook received', {
      provider: env.VOICE_PROVIDER,
      contentType: request.headers.get('content-type'),
      headersSummary: Object.keys(headers).join(', ')
    });
    
    // Get provider and verify webhook signature
    const voiceProvider = getActiveProvider();
    const signature = request.headers.get('x-signature') || 
                      request.headers.get('x-retell-signature') || 
                      request.headers.get('x-vapi-signature') || '';
    
    const webhookSecret = env.RETELL_WEBHOOK_SECRET || env.VAPI_WEBHOOK_SECRET || '';
    const isValidSignature = await voiceProvider.verifyWebhook(signature, body, webhookSecret);
    
    if (!isValidSignature) {
      requestLogger.error('Invalid webhook signature', { signature: signature.substring(0, 20) });
      return NextResponse.json(
        { error: 'Invalid signature', requestId },
        { status: 401 }
      );
    }
    
    // Parse webhook payload
    const rawPayload = JSON.parse(body);
    const providerEvent = await voiceProvider.parseEvent(rawPayload);
    
    // Validate the parsed event
    const validatedEvent = ProviderEventSchema.parse(providerEvent);
    
    requestLogger.info('Webhook event parsed', {
      provider: validatedEvent.provider,
      providerCallId: validatedEvent.providerCallId,
      event: validatedEvent.event,
      status: validatedEvent.status
    });
    
    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        provider: validatedEvent.provider,
        providerCallId: validatedEvent.providerCallId
      },
      include: {
        demoSession: true
      }
    });
    
    if (!call) {
      requestLogger.warn('Call not found for webhook', {
        provider: validatedEvent.provider,
        providerCallId: validatedEvent.providerCallId
      });
      return NextResponse.json(
        { error: 'Call not found', requestId },
        { status: 404 }
      );
    }
    
    // Update sessionId in the event
    validatedEvent.sessionId = call.demoSessionId;
    
    // Create deduplication key for idempotency
    const dedupeKey = `${validatedEvent.provider}:${validatedEvent.providerCallId}:${validatedEvent.event}:${validatedEvent.timestamp}`;
    
    // Store webhook event (with deduplication)
    await prisma.webhookEvent.upsert({
      where: {
        dedupeKey_provider: {
          dedupeKey,
          provider: validatedEvent.provider
        }
      },
      update: {
        status: validatedEvent.status,
        timestamp: new Date(validatedEvent.timestamp),
        summary: validatedEvent.summary,
        transcriptUrl: validatedEvent.transcriptUrl,
        metadata: validatedEvent.metadata,
      },
      create: {
        demoSessionId: call.demoSessionId,
        callId: call.id,
        provider: validatedEvent.provider,
        providerEventId: validatedEvent.providerCallId,
        dedupeKey,
        event: validatedEvent.event,
        status: validatedEvent.status,
        timestamp: new Date(validatedEvent.timestamp),
        summary: validatedEvent.summary,
        transcriptUrl: validatedEvent.transcriptUrl,
        metadata: validatedEvent.metadata,
      }
    });
    
    // Update call status
    const updateData: any = {
      status: validatedEvent.status,
      lastEventAt: new Date(validatedEvent.timestamp),
    };
    
    // Set completion data if call is finished
    if (validatedEvent.status === 'COMPLETED') {
      updateData.completedAt = new Date(validatedEvent.timestamp);
      updateData.summary = validatedEvent.summary;
      updateData.transcriptUrl = validatedEvent.transcriptUrl;
      
      // Update demo session status
      await prisma.demoSession.update({
        where: { id: call.demoSessionId },
        data: { status: 'COMPLETED' }
      });
    }
    
    await prisma.call.update({
      where: { id: call.id },
      data: updateData
    });
    
    requestLogger.info('Webhook processed successfully', {
      callId: call.id,
      sessionId: call.demoSessionId,
      status: validatedEvent.status,
      dedupeKey
    });
    
    return NextResponse.json({
      success: true,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof ProviderError) {
      return NextResponse.json(
        { error: 'Provider error', requestId },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  }
}