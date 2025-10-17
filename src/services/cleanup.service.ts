import { logger } from '@/lib/logger'
import { awazWebSocketService } from './awaz-websocket.service'
import { twilioMediaService } from './twilio-media.service'

export class CleanupService {
  private isShuttingDown = false

  constructor() {
    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown('SIGINT'))
    process.on('SIGTERM', () => this.shutdown('SIGTERM'))
    process.on('SIGQUIT', () => this.shutdown('SIGQUIT'))
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error)
      this.shutdown('uncaughtException')
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason)
      this.shutdown('unhandledRejection')
    })
  }

  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress, ignoring signal:', signal)
      return
    }

    this.isShuttingDown = true
    logger.info('Starting graceful shutdown:', signal)

    try {
      // Cleanup WebSocket connections
      logger.info('Cleaning up Awaz WebSocket connections...')
      await awazWebSocketService.cleanup()

      // Cleanup Twilio media streams
      logger.info('Cleaning up Twilio media streams...')
      twilioMediaService.cleanup()

      logger.info('Graceful shutdown completed')
      
      // Exit the process
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  }

  /**
   * Check if the service is shutting down
   */
  isShuttingDown(): boolean {
    return this.isShuttingDown
  }
}

// Initialize cleanup service
export const cleanupService = new CleanupService()
