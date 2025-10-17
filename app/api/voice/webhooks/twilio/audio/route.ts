import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { twilioMediaService } from '@/services/twilio-media.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callSid = searchParams.get('callSid')
    const streamSid = searchParams.get('streamSid')

    if (!callSid || !streamSid) {
      return NextResponse.json(
        { error: 'CallSid and StreamSid are required' },
        { status: 400 }
      )
    }

    // Check if stream is active
    if (!twilioMediaService.isStreamActive(callSid, streamSid)) {
      return NextResponse.json(
        { error: 'Stream not active' },
        { status: 404 }
      )
    }

    // Get queued audio data
    const audioData = twilioMediaService.getQueuedAudio(callSid, streamSid)

    if (audioData.length === 0) {
      return NextResponse.json({ audio: [], hasAudio: false })
    }

    // Convert audio data to base64 for transmission
    const audioBase64 = audioData.map(buffer => buffer.toString('base64'))

    logger.debug('Retrieved queued audio for Twilio', { 
      callSid, 
      streamSid, 
      audioCount: audioData.length 
    })

    return NextResponse.json({ 
      audio: audioBase64, 
      hasAudio: true,
      count: audioData.length 
    })

  } catch (error) {
    logger.error('Failed to retrieve audio for Twilio', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { error: 'Failed to retrieve audio' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { callSid, streamSid, audioData } = body

    if (!callSid || !streamSid || !audioData) {
      return NextResponse.json(
        { error: 'CallSid, StreamSid, and audioData are required' },
        { status: 400 }
      )
    }

    // Convert base64 audio back to buffer and queue it
    const audioBuffer = Buffer.from(audioData, 'base64')
    twilioMediaService.queueAudio(callSid, streamSid, audioBuffer)

    logger.debug('Audio queued for Twilio stream', { 
      callSid, 
      streamSid, 
      audioLength: audioBuffer.length 
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Failed to queue audio for Twilio', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { error: 'Failed to queue audio' },
      { status: 500 }
    )
  }
}
