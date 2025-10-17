import { logger } from '@/lib/logger'

interface TwilioMediaStream {
  callSid: string
  streamSid: string
  audioQueue: Buffer[]
  isActive: boolean
}

export class TwilioMediaService {
  private streams: Map<string, TwilioMediaStream> = new Map()

  /**
   * Create a new media stream for a call
   */
  createStream(callSid: string, streamSid: string): void {
    const streamKey = `${callSid}-${streamSid}`
    
    this.streams.set(streamKey, {
      callSid,
      streamSid,
      audioQueue: [],
      isActive: true
    })

    logger.info('Twilio media stream created', { callSid, streamSid })
  }

  /**
   * Queue audio data to be sent back to Twilio
   */
  queueAudio(callSid: string, streamSid: string, audioData: Buffer): void {
    const streamKey = `${callSid}-${streamSid}`
    const stream = this.streams.get(streamKey)

    if (stream && stream.isActive) {
      stream.audioQueue.push(audioData)
      logger.debug('Audio queued for Twilio', { 
        callSid, 
        streamSid, 
        queueLength: stream.audioQueue.length 
      })
    } else {
      logger.warn('No active stream for audio queue', { callSid, streamSid })
    }
  }

  /**
   * Get queued audio data for a stream
   */
  getQueuedAudio(callSid: string, streamSid: string): Buffer[] {
    const streamKey = `${callSid}-${streamSid}`
    const stream = this.streams.get(streamKey)

    if (stream && stream.isActive) {
      const audio = [...stream.audioQueue]
      stream.audioQueue = [] // Clear the queue
      return audio
    }

    return []
  }

  /**
   * Close a media stream
   */
  closeStream(callSid: string, streamSid: string): void {
    const streamKey = `${callSid}-${streamSid}`
    const stream = this.streams.get(streamKey)

    if (stream) {
      stream.isActive = false
      stream.audioQueue = []
      this.streams.delete(streamKey)
      logger.info('Twilio media stream closed', { callSid, streamSid })
    }
  }

  /**
   * Generate TwiML for sending audio to Twilio
   */
  generateAudioTwiML(audioData: Buffer): string {
    // Convert audio data to base64 for TwiML
    const base64Audio = audioData.toString('base64')
    
    // Generate TwiML to send audio back to the caller
    // Note: This is a simplified approach. In a real implementation,
    // you might need to use Twilio's Media Streams API differently
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Playing response audio</Say>
</Response>`
  }

  /**
   * Get stream status
   */
  isStreamActive(callSid: string, streamSid: string): boolean {
    const streamKey = `${callSid}-${streamSid}`
    const stream = this.streams.get(streamKey)
    return stream?.isActive || false
  }

  /**
   * Get all active streams
   */
  getActiveStreams(): string[] {
    return Array.from(this.streams.keys()).filter(key => {
      const stream = this.streams.get(key)
      return stream?.isActive || false
    })
  }

  /**
   * Cleanup all streams
   */
  cleanup(): void {
    logger.info('Cleaning up Twilio media streams')
    
    for (const [key, stream] of this.streams.entries()) {
      stream.isActive = false
      stream.audioQueue = []
    }
    
    this.streams.clear()
  }
}

// Singleton instance
export const twilioMediaService = new TwilioMediaService()
