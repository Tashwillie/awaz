import { WebSocket } from 'ws'
import { logger } from '@/lib/logger'
import { getEnv } from '@/lib/env'
import { twilioMediaService } from './twilio-media.service'

interface AwazConnection {
  ws: WebSocket
  callSid: string
  streamSid: string
  agentId: string
  isConnected: boolean
  audioQueue: Buffer[]
  lastHeartbeat: number
}

interface AwazMessage {
  type: 'audio' | 'text' | 'control' | 'heartbeat'
  data: any
  timestamp: number
  callId: string
}

export class AwazWebSocketService {
  private connections: Map<string, AwazConnection> = new Map()
  private env = getEnv()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startHeartbeat()
  }

  /**
   * Create a new WebSocket connection to Awaz
   */
  async createConnection(callSid: string, streamSid: string, agentId?: string): Promise<void> {
    try {
      const connectionKey = `${callSid}-${streamSid}`
      
      // Close existing connection if any
      if (this.connections.has(connectionKey)) {
        await this.closeConnection(callSid, streamSid)
      }

      logger.info('Creating Awaz WebSocket connection', { 
        callSid, 
        streamSid, 
        agentId: agentId || 'default' 
      })

      // Create WebSocket connection to Awaz
      const ws = new WebSocket('wss://api.awaz.ai/v1/stream', {
        headers: {
          'Authorization': `Bearer ${this.env.AWAZ_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Funnder-Twilio-Integration/1.0'
        }
      })

      const connection: AwazConnection = {
        ws,
        callSid,
        streamSid,
        agentId: agentId || this.env.AWAZ_AGENT_ID || 'default-agent',
        isConnected: false,
        audioQueue: [],
        lastHeartbeat: Date.now()
      }

      // Set up WebSocket event handlers
      ws.on('open', () => {
        logger.info('Awaz WebSocket connected', { callSid, streamSid })
        connection.isConnected = true
        connection.lastHeartbeat = Date.now()
        
        // Send initial configuration
        this.sendMessage(connection, {
          type: 'control',
          data: {
            action: 'initialize',
            callId: callSid,
            agentId: connection.agentId,
            sessionId: callSid,
            audioFormat: 'mulaw',
            sampleRate: 8000
          },
          timestamp: Date.now(),
          callId: callSid
        })
      })

      ws.on('message', (data: Buffer) => {
        try {
          const message: AwazMessage = JSON.parse(data.toString())
          this.handleAwazMessage(connection, message)
        } catch (error) {
          logger.error('Failed to parse Awaz message', { 
            callSid, 
            streamSid, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
      })

      ws.on('error', (error) => {
        logger.error('Awaz WebSocket error', { 
          callSid, 
          streamSid, 
          error: error.message 
        })
        connection.isConnected = false
      })

      ws.on('close', (code, reason) => {
        logger.info('Awaz WebSocket closed', { 
          callSid, 
          streamSid, 
          code, 
          reason: reason.toString() 
        })
        connection.isConnected = false
        this.connections.delete(connectionKey)
      })

      this.connections.set(connectionKey, connection)

    } catch (error) {
      logger.error('Failed to create Awaz WebSocket connection', { 
        callSid, 
        streamSid, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      throw error
    }
  }

  /**
   * Send audio data to Awaz
   */
  async sendAudio(callSid: string, streamSid: string, audioData: Buffer): Promise<void> {
    const connectionKey = `${callSid}-${streamSid}`
    const connection = this.connections.get(connectionKey)

    if (!connection || !connection.isConnected) {
      logger.warn('No active Awaz connection for audio data', { callSid, streamSid })
      return
    }

    try {
      // Convert Twilio mu-law audio to the format Awaz expects
      const awazAudioData = this.convertAudioFormat(audioData)

      this.sendMessage(connection, {
        type: 'audio',
        data: {
          audio: awazAudioData.toString('base64'),
          format: 'mulaw',
          sampleRate: 8000
        },
        timestamp: Date.now(),
        callId: callSid
      })

    } catch (error) {
      logger.error('Failed to send audio to Awaz', { 
        callSid, 
        streamSid, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  /**
   * Handle incoming messages from Awaz
   */
  private handleAwazMessage(connection: AwazConnection, message: AwazMessage): void {
    logger.debug('Received message from Awaz', { 
      callSid: connection.callSid, 
      streamSid: connection.streamSid, 
      type: message.type 
    })

    switch (message.type) {
      case 'audio':
        // Handle audio response from Awaz
        this.handleAwazAudio(connection, message.data)
        break

      case 'text':
        // Handle text response from Awaz (for logging/debugging)
        logger.info('Awaz text response', { 
          callSid: connection.callSid, 
          text: message.data.text 
        })
        break

      case 'control':
        // Handle control messages from Awaz
        this.handleAwazControl(connection, message.data)
        break

      case 'heartbeat':
        // Update heartbeat timestamp
        connection.lastHeartbeat = Date.now()
        break

      default:
        logger.warn('Unknown Awaz message type', { 
          callSid: connection.callSid, 
          type: message.type 
        })
    }
  }

  /**
   * Handle audio response from Awaz and send to Twilio
   */
  private handleAwazAudio(connection: AwazConnection, audioData: any): void {
    try {
      // Convert Awaz audio format back to Twilio format
      const twilioAudioData = this.convertToTwilioFormat(audioData.audio)
      
      // Queue audio for Twilio Media Stream
      twilioMediaService.queueAudio(
        connection.callSid, 
        connection.streamSid, 
        twilioAudioData
      )
      
      logger.debug('Received audio from Awaz and queued for Twilio', { 
        callSid: connection.callSid, 
        streamSid: connection.streamSid,
        audioLength: twilioAudioData.length 
      })

    } catch (error) {
      logger.error('Failed to handle Awaz audio', { 
        callSid: connection.callSid, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  /**
   * Handle control messages from Awaz
   */
  private handleAwazControl(connection: AwazConnection, controlData: any): void {
    logger.info('Awaz control message', { 
      callSid: connection.callSid, 
      control: controlData 
    })

    switch (controlData.action) {
      case 'ready':
        logger.info('Awaz agent is ready', { callSid: connection.callSid })
        break

      case 'error':
        logger.error('Awaz error', { 
          callSid: connection.callSid, 
          error: controlData.error 
        })
        break

      default:
        logger.info('Unknown Awaz control action', { 
          callSid: connection.callSid, 
          action: controlData.action 
        })
    }
  }

  /**
   * Close WebSocket connection
   */
  async closeConnection(callSid: string, streamSid: string): Promise<void> {
    const connectionKey = `${callSid}-${streamSid}`
    const connection = this.connections.get(connectionKey)

    if (connection) {
      logger.info('Closing Awaz WebSocket connection', { callSid, streamSid })
      
      if (connection.isConnected) {
        // Send disconnect message
        this.sendMessage(connection, {
          type: 'control',
          data: { action: 'disconnect' },
          timestamp: Date.now(),
          callId: callSid
        })
        
        connection.ws.close(1000, 'Call ended')
      }
      
      this.connections.delete(connectionKey)
    }
  }

  /**
   * Send message to Awaz
   */
  private sendMessage(connection: AwazConnection, message: AwazMessage): void {
    if (!connection.isConnected) {
      logger.warn('Cannot send message - WebSocket not connected', { 
        callSid: connection.callSid 
      })
      return
    }

    try {
      connection.ws.send(JSON.stringify(message))
    } catch (error) {
      logger.error('Failed to send message to Awaz', { 
        callSid: connection.callSid, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  /**
   * Convert Twilio mu-law audio to Awaz format
   */
  private convertAudioFormat(audioData: Buffer): Buffer {
    // Twilio sends mu-law encoded audio at 8kHz
    // Awaz might expect a different format (PCM, different sample rate, etc.)
    // For now, we'll pass it through as-is, but this could be enhanced
    return audioData
  }

  /**
   * Convert Awaz audio format back to Twilio format
   */
  private convertToTwilioFormat(awazAudio: string): Buffer {
    // Convert base64 audio back to buffer
    // This might need format conversion depending on what Awaz sends
    return Buffer.from(awazAudio, 'base64')
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      const timeout = 30000 // 30 seconds

      for (const [key, connection] of this.connections.entries()) {
        if (now - connection.lastHeartbeat > timeout) {
          logger.warn('Awaz connection heartbeat timeout', { 
            callSid: connection.callSid, 
            streamSid: connection.streamSid 
          })
          this.closeConnection(connection.callSid, connection.streamSid)
        } else if (connection.isConnected) {
          // Send heartbeat
          this.sendMessage(connection, {
            type: 'heartbeat',
            data: { timestamp: now },
            timestamp: now,
            callId: connection.callSid
          })
        }
      }
    }, 10000) // Check every 10 seconds
  }

  /**
   * Get connection status
   */
  getConnectionStatus(callSid: string, streamSid: string): boolean {
    const connectionKey = `${callSid}-${streamSid}`
    const connection = this.connections.get(connectionKey)
    return connection?.isConnected || false
  }

  /**
   * Cleanup all connections
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up Awaz WebSocket connections')
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    const closePromises = Array.from(this.connections.keys()).map(key => {
      const [callSid, streamSid] = key.split('-')
      return this.closeConnection(callSid, streamSid)
    })

    await Promise.all(closePromises)
  }
}

// Singleton instance
export const awazWebSocketService = new AwazWebSocketService()
