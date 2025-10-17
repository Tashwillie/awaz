import { NextRequest, NextResponse } from 'next/server'
import { getActiveProvider } from '@/services/providers/voice/register'
import { logger } from '@/lib/logger'
import { getEnv } from '@/lib/env'

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestLogger = logger.child({ requestId })
  
  try {
    const env = getEnv()
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    requestLogger.info('Awaz webhook received', {
      contentType: request.headers.get('content-type'),
      headersSummary: Object.keys(headers).join(', ')
    })
    
    // Get Awaz provider specifically
    const awazProvider = getActiveProvider()
    
    // Extract Awaz signature
    const signature = request.headers.get('x-awaz-signature') || ''
    
    // Verify webhook signature
    const isValidSignature = await awazProvider.verifyWebhook(
      signature, 
      body, 
      env.AWAZ_WEBHOOK_SECRET || ''
    )
    
    if (!isValidSignature) {
      requestLogger.error('Invalid Awaz webhook signature', { 
        signature: signature.substring(0, 20) 
      })
      return NextResponse.json(
        { error: 'Invalid signature', requestId },
        { status: 401 }
      )
    }
    
    // Parse webhook payload
    const rawPayload = JSON.parse(body)
    const providerEvent = await awazProvider.parseEvent(rawPayload)
    
    requestLogger.info('Awaz webhook event parsed', {
      providerCallId: providerEvent.providerCallId,
      event: providerEvent.event,
      status: providerEvent.status
    })
    
    // TODO: Process the webhook event
    // - Update call status in database
    // - Send notifications
    // - Update analytics
    // - Handle call completion, failures, etc.
    
    return NextResponse.json({
      success: true,
      requestId,
      event: providerEvent.event,
      status: providerEvent.status
    })
    
  } catch (error) {
    requestLogger.error('Awaz webhook processing failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    )
  }
}
