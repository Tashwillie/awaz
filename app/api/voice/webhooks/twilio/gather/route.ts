import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const digits = formData.get('Digits') as string
    const from = formData.get('From') as string

    logger.info('Twilio gather webhook received', { 
      callSid, 
      from: '[REDACTED]',
      digits
    })

    if (digits === '1') {
      // User pressed 1 - connect to Awaz
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting you to our AI assistant now.</Say>
  <Connect>
    <Stream url="wss://api.awaz.ai/v1/stream" track="both_tracks">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="sessionId" value="${callSid}" />
      <Parameter name="agentId" value="${process.env.AWAZ_AGENT_ID || 'default-agent'}" />
    </Stream>
  </Connect>
</Response>`

      logger.info('User requested AI connection', { callSid })
      return new NextResponse(twiml, { 
        headers: { 'Content-Type': 'application/xml' } 
      })
    } else {
      // No input or other digits - end call
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Have a great day!</Say>
  <Hangup />
</Response>`

      logger.info('Call ended - no AI connection requested', { callSid })
      return new NextResponse(twiml, { 
        headers: { 'Content-Type': 'application/xml' } 
      })
    }

  } catch (error) {
    logger.error('Twilio gather webhook error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, there was an error. Please try again later.</Say></Response>',
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}
