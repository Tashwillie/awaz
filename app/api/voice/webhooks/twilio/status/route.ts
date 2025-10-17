import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const callStatus = formData.get('CallStatus') as string
    const duration = formData.get('CallDuration') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string

    logger.info('Twilio status callback received', { 
      callSid, 
      callStatus, 
      duration,
      from: '[REDACTED]',
      to: '[REDACTED]'
    })

    // Store call status in database or send to analytics
    // For now, just log the status
    if (callStatus === 'completed') {
      logger.info('Call completed successfully', { 
        callSid, 
        duration: duration ? `${duration} seconds` : 'unknown'
      })
    }

    return new NextResponse('OK')
  } catch (error) {
    logger.error('Twilio status callback error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return new NextResponse('OK') // Always return OK to Twilio
  }
}
