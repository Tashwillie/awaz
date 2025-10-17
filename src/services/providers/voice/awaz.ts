import { VoiceProvider, ProviderEvent } from '@/types/webhook';
import { ProviderError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { createHmac, timingSafeEqual } from 'crypto';
import { getEnv } from '@/lib/env';

export class AwazProvider implements VoiceProvider {
  private apiKey: string;
  private baseUrl = 'https://api.awaz.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startCall(
    sessionId: string,
    phoneNumberE164: string,
    businessProfile: any,
    agentId?: string
  ): Promise<string> {
    logger.info('Starting Awaz call', { sessionId, phone: '[REDACTED]' });
    
    try {
      const env = getEnv();
      const effectiveAgentId = agentId || env.AWAZ_AGENT_ID || 'default-agent';
      
      if (!env.AWAZ_AGENT_ID && !agentId) {
        logger.warn('No AWAZ_AGENT_ID configured, using default agent');
      }
      
      const response = await fetch(`${this.baseUrl}/v1/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumberE164,
          agent_id: effectiveAgentId,
          session_id: sessionId,
          context: {
            business_profile: businessProfile,
          },
        }),
      });

      if (!response.ok) {
        throw new ProviderError(`Awaz API error: ${response.statusText}`, 'awaz', response.status);
      }

      const data = await response.json();
      return data.call_id;
    } catch (error) {
      logger.error('Awaz startCall failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new ProviderError('Failed to start Awaz call', 'awaz');
    }
  }

  async verifyWebhook(signature: string, body: string, secret: string): Promise<boolean> {
    try {
      // In development/test mode, skip signature verification
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        logger.warn('Skipping Awaz webhook signature verification in dev/test mode');
        return true;
      }

      // Check if signature exists
      if (!signature) {
        logger.error('Awaz webhook signature missing');
        return false;
      }

      // Check if webhook secret is configured
      if (!secret) {
        logger.warn('Awaz webhook secret not configured - accepting webhook');
        return true;
      }

      // Awaz typically uses HMAC-SHA256 for webhook verification
      // The signature is usually in the format: "sha256=<hash>"
      let expectedSignature: string;
      let receivedSignature: string;

      if (signature.startsWith('sha256=')) {
        // Signature includes the algorithm prefix
        receivedSignature = signature.substring(7); // Remove 'sha256=' prefix
        const hmac = createHmac('sha256', secret);
        hmac.update(body, 'utf8');
        expectedSignature = hmac.digest('hex');
      } else {
        // Signature is just the hash
        receivedSignature = signature;
        const hmac = createHmac('sha256', secret);
        hmac.update(body, 'utf8');
        expectedSignature = hmac.digest('hex');
      }

      // Use timing-safe comparison to prevent timing attacks
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      const receivedBuffer = Buffer.from(receivedSignature, 'hex');

      if (expectedBuffer.length !== receivedBuffer.length) {
        logger.error('Awaz webhook signature length mismatch');
        return false;
      }

      const isValid = timingSafeEqual(expectedBuffer, receivedBuffer);

      if (!isValid) {
        logger.error('Awaz webhook signature verification failed', {
          expectedLength: expectedBuffer.length,
          receivedLength: receivedBuffer.length
        });
      } else {
        logger.info('Awaz webhook signature verified successfully');
      }

      return isValid;

    } catch (error) {
      logger.error('Awaz webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async parseEvent(payload: any): Promise<ProviderEvent> {
    return {
      provider: 'awaz',
      providerCallId: payload.call_id || '',
      sessionId: payload.session_id || '',
      event: payload.event || 'unknown',
      status: payload.status || 'unknown',
      timestamp: payload.timestamp || new Date().toISOString(),
      summary: payload.summary,
      transcriptUrl: payload.transcript_url,
      transcript: payload.transcript,
      metadata: payload.metadata || {},
    };
  }
}







