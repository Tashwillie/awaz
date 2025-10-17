import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getEnv } from '@/lib/env'
import { awazWebSocketService } from '@/services/awaz-websocket.service'
import { twilioMediaService } from '@/services/twilio-media.service'
import { cleanupService } from '@/services/cleanup.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const streamSid = formData.get('StreamSid') as string
    const event = formData.get('Event') as string

    logger.info('Twilio media stream event received', { 
      callSid, 
      streamSid,
      event
    })

    const env = getEnv()

    // Handle different stream events
    switch (event) {
      case 'start':
        // Stream started - initialize connection to Awaz
        logger.info('Media stream started, connecting to Awaz', { callSid, streamSid })
        
        try {
          // Get agent ID from database if available
          let agentId = env.AWAZ_AGENT_ID || 'default-agent'
          
          // Try to find the call in database to get session info
          const call = await prisma.call.findFirst({
            where: { twilioCallSid: callSid },
            include: { DemoSession: true }
          })
          
          if (call?.DemoSession?.providerAgentId) {
            agentId = call.DemoSession.providerAgentId
          }
          
          // Create Twilio media stream
          twilioMediaService.createStream(callSid, streamSid)
          
          // Create WebSocket connection to Awaz
          await awazWebSocketService.createConnection(callSid, streamSid, agentId)
          
          logger.info('Awaz WebSocket connection established', { callSid, streamSid, agentId })
        } catch (error) {
          logger.error('Failed to connect to Awaz', { 
            callSid, 
            streamSid, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
        
        return new NextResponse('OK')

      case 'media':
        // Audio data received from caller
        const mediaPayload = formData.get('MediaPayload') as string
        const sequenceNumber = formData.get('SequenceNumber') as string
        
        logger.debug('Audio data received', { 
          callSid, 
          streamSid, 
          sequenceNumber,
          payloadLength: mediaPayload?.length || 0
        })

        if (mediaPayload) {
          try {
            // Decode base64 audio payload from Twilio
            const audioData = Buffer.from(mediaPayload, 'base64')
            
            // Send audio data to Awaz via WebSocket
            await awazWebSocketService.sendAudio(callSid, streamSid, audioData)
            
            logger.debug('Audio forwarded to Awaz', { 
              callSid, 
              streamSid, 
              sequenceNumber,
              audioLength: audioData.length
            })
          } catch (error) {
            logger.error('Failed to forward audio to Awaz', { 
              callSid, 
              streamSid, 
              sequenceNumber,
              error: error instanceof Error ? error.message : 'Unknown error' 
            })
          }
        }
        
        return new NextResponse('OK')

      case 'stop':
        // Stream ended
        logger.info('Media stream ended', { callSid, streamSid })
        
        try {
          // Close Twilio media stream
          twilioMediaService.closeStream(callSid, streamSid)
          
          // Close Awaz WebSocket connection
          await awazWebSocketService.closeConnection(callSid, streamSid)
          
          // Update call status in database
          await prisma.call.updateMany({
            where: { twilioCallSid: callSid },
            data: { 
              status: 'COMPLETED',
              endedAt: new Date()
            }
          })
          
          logger.info('Call completed and connections closed', { callSid, streamSid })
        } catch (error) {
          logger.error('Failed to close connections or update call status', { 
            callSid, 
            streamSid, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
        
        return new NextResponse('OK')

      default:
        logger.info('Unknown stream event', { callSid, streamSid, event })
        return new NextResponse('OK')
    }

  } catch (error) {
    logger.error('Twilio stream webhook error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return new NextResponse('OK') // Always return OK to Twilio
  }
}
