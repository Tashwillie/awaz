import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  try {
    const sessionId = params.id;
    
    requestLogger.info('Demo status requested', { sessionId });
    
    const session = await prisma.demoSession.findUnique({
      where: { id: sessionId },
      include: {
        businessProfile: true,
        businessContext: true,
        calls: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        lead: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Demo session not found', requestId },
        { status: 404 }
      );
    }

    const latestCall = session.calls[0];
    
    return NextResponse.json({
      status: session.status,
      callStatus: latestCall?.status,
      businessProfile: session.businessProfile?.json,
      businessContext: session.businessContext,
      call: latestCall ? {
        id: latestCall.id,
        status: latestCall.status,
        providerCallId: latestCall.providerCallId,
        startedAt: latestCall.startedAt?.toISOString(),
        connectedAt: latestCall.connectedAt?.toISOString(),
        endedAt: latestCall.endedAt?.toISOString(),
        durationSec: latestCall.durationSec,
        summary: latestCall.summary,
        transcriptUrl: latestCall.transcriptUrl,
      } : null,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Demo status check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  }
}
