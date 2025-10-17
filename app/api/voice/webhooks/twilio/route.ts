import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getEnv } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string
    const direction = formData.get('Direction') as string

    logger.info('Twilio webhook received', { 
      callSid, 
      from: '[REDACTED]', 
      to: '[REDACTED]', 
      callStatus,
      direction
    })

    const env = getEnv()

    // Handle different call statuses
    switch (callStatus) {
      case 'ringing':
        // Call is ringing - prepare for connection
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Please hold while we connect you to our AI assistant.</Say></Response>',
          { headers: { 'Content-Type': 'application/xml' } }
        )

      case 'in-progress':
        // Call is answered - connect to Awaz
        if (direction === 'inbound') {
          // For inbound calls, connect to Awaz using Media Streams
          const awazWebSocketUrl = env.NODE_ENV === 'development' 
            ? 'wss://api.awaz.ai/v1/stream' 
            : 'wss://api.awaz.ai/v1/stream'
          
          const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! Thank you for calling. Connecting you to our AI assistant.</Say>
  <Connect>
    <Stream url="${awazWebSocketUrl}" track="both_tracks">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="sessionId" value="${callSid}" />
      <Parameter name="agentId" value="${env.AWAZ_AGENT_ID || 'default-agent'}" />
    </Stream>
  </Connect>
</Response>`

          logger.info('Connecting call to Awaz via Media Streams', { callSid })
          return new NextResponse(twiml, { 
            headers: { 'Content-Type': 'application/xml' } 
          })
        } else {
          // For outbound calls (test calls), use different approach
          const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! This is your Funnder AI assistant. How can I help you today?</Say>
  <Gather numDigits="1" timeout="10" action="${process.env.NEXT_PUBLIC_API_URL}/api/voice/webhooks/twilio/gather">
    <Say voice="alice">Press 1 to speak with our AI, or wait for assistance.</Say>
  </Gather>
  <Say voice="alice">Thank you for calling. Have a great day!</Say>
</Response>`

          return new NextResponse(twiml, { 
            headers: { 'Content-Type': 'application/xml' } 
          })
        }

      case 'completed':
        // Call ended
        logger.info('Call completed', { callSid })
        return new NextResponse('OK')

      default:
        // Default response for other statuses
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you for calling. Please try again later.</Say></Response>',
          { headers: { 'Content-Type': 'application/xml' } }
        )
    }

  } catch (error) {
    logger.error('Twilio webhook error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, there was an error. Please try again later.</Say></Response>',
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}
