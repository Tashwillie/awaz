import { VoiceProvider, ProviderEvent } from '@/types/webhook';
import { ProviderError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class AwazProvider implements VoiceProvider {
  private apiKey: string;
  private baseUrl = 'https://api.awaz.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startCall(input: { phone: string; profile: any }): Promise<{ callId: string }> {
    logger.info('Starting Awaz call', { phone: '[REDACTED]' });
    
    try {
      const response = await fetch(`${this.baseUrl}/v1/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: input.phone,
          agent_id: 'awaz-agent-id',
          context: {
            business_profile: input.profile,
          },
        }),
      });

      if (!response.ok) {
        throw new ProviderError(`Awaz API error: ${response.statusText}`, 'awaz', response.status);
      }

      const data = await response.json();
      return { callId: data.call_id };
    } catch (error) {
      logger.error('Awaz startCall failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new ProviderError('Failed to start Awaz call', 'awaz');
    }
  }

  verifyWebhook(headers: Record<string, string>, rawBody: string): boolean {
    const signature = headers['x-awaz-signature'];
    if (!signature) {
      return false;
    }
    
    return true;
  }

  parseEvent(body: unknown): ProviderEvent {
    const data = body as any;
    
    return {
      type: data.event || 'unknown',
      call_id: data.call_id || '',
      lead: {
        name: data.customer?.name,
        phone: data.customer?.phone || '',
        email: data.customer?.email,
      },
      summary: data.summary,
      transcript_url: data.transcript_url,
      booking: data.booking ? {
        start: data.booking.start_time,
        end: data.booking.end_time,
        location: data.booking.location,
        reference: data.booking.confirmation_code,
        notes: data.booking.notes,
      } : undefined,
    };
  }
}







