import { VoiceProvider } from '@/types/webhook';
import { ProviderEvent } from '@/types/webhook';
import { logger } from '@/lib/logger';
import { ProviderError } from '@/lib/errors';
import { getEnv } from '@/lib/env';
import { BusinessProfileJson } from '@/types/profile';

interface RetellCallRequest {
  phone_number_id: string;
  agent_id: string;
  from_number: string;
  to_number: string;
  override_agent_config?: {
    dynamic_variables?: Record<string, string>;
  };
}

interface RetellCallResponse {
  call_id: string;
  create_phone_call_ifneeded: boolean;
  phone_calls?: Array<{
    call_id: string;
    to_number: string;
  }>;
}

interface RetellWebhookEvent {
  call_id: string;
  event: string;
  timestamp: number;
  end_state?: string;
  transcript?: string;
  recording_url?: string;
  analysis?: {
    transcript: string;
    summary?: string;
    intent?: string;
    entities?: Record<string, any>;
  };
}

export class RetellProvider implements VoiceProvider {
  private apiKey: string;
  private baseUrl = 'https://api.retellai.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startCall(
    sessionId: string,
    phoneNumberE164: string,
    businessProfile: BusinessProfileJson,
    agentId?: string
  ): Promise<string> {
    const env = getEnv();
    logger.info('Starting Retell call', { sessionId, phoneNumberE164 });

    try {
      // Use predefined agentId or default
      const effectiveAgentId = agentId || 'agent-default';
      
      let callRequest: RetellCallRequest = {
        phone_number_id: 'phone-default', // In production, use real phone number ID
        agent_id: effectiveAgentId,
        from_number: '+1234567890', // In production, use real business number
        to_number: phoneNumberE164,
        override_agent_config: {
          dynamic_variables: this.buildBusinessContext(businessProfile),
        },
      };

      // In development/test mode, return fake call ID to avoid real API calls
      if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
        const mockCallId = `retell-dev-${sessionId}-${Date.now()}`;
        logger.info('Using mock Retell call ID for dev/test', { callId: mockCallId });
        return mockCallId;
      }

      const response = await fetch(`${this.baseUrl}/v2/create-phone-call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `Retell API error: ${response.status} ${response.statusText} - ${errorText}`,
          'retell',
          response.status
        );
      }

      const data: RetellCallResponse = await response.json();
      const callId = data.call_id || data.phone_calls?.[0]?.call_id;

      if (!callId) {
        throw new ProviderError('No call ID returned from Retell API', 'retell', 500);
      }

      logger.info('Retell call started successfully', { callId, sessionId });
      return callId;
    } catch (error) {
      logger.error('Retell startCall failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        phoneNumberE164,
      });
      throw error;
    }
  }

  async verifyWebhook(signature: string, body: string, secret: string): Promise<boolean> {
    try {
      // In development/test mode, skip signature verification
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        logger.warn('Skipping Retell webhook signature verification in dev/test mode');
        return true;
      }

      // TODO: Implement actual Retell webhook signature verification
      // Retell typically uses HMAC-SHA256 with a webhook secret
      logger.warn('Retell webhook signature verification not yet implemented - accepting all');
      return true;
    } catch (error) {
      logger.error('Retell webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async parseEvent(payload: RetellWebhookEvent): Promise<ProviderEvent> {
    logger.info('Parsing Retell event', { 
      callId: payload.call_id,
      event: payload.event,
      endState: payload.end_state 
    });

    try {
      // Map Retell event status to our normalized status
      const getCallStatus = (endState?: string) => {
        switch (endState) {
          case 'ended_by_agent':
          case 'ended_by_user':
          case 'ended_by_server':
            return 'COMPLETED';
          case 'ended_by_agent_call_back_limit_reached':
          case 'ended_by_agent_call_duration_reached':
          case 'ended_by_classifier_detected_interruption':
          case 'ended_by_classifier_realtime_escalation':
            return 'COMPLETED';
          default:
            return endState ? endState.toUpperCase().replace(/[^A-Z_]/g, '_') : 'UNKNOWN';
        }
      };

      return {
        provider: 'retell',
        providerCallId: payload.call_id,
        sessionId: '', // Will be populated from DB lookup
        event: payload.event,
        status: getCallStatus(payload.end_state),
        timestamp: new Date(payload.timestamp * 1000).toISOString(),
        summary: payload.analysis?.summary || payload.transcript?.substring(0, 500),
        transcriptUrl: payload.recording_url,
        transcript: payload.transcript,
        metadata: {
          end_state: payload.end_state,
          analysis: payload.analysis,
        },
      };
    } catch (error) {
      logger.error('Failed to parse Retell event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        payload: JSON.stringify(payload).substring(0, 200),
      });
      throw new ProviderError('Failed to parse Retell webhook event', 'retell', 400);
    }
  }

  private buildBusinessContext(businessProfile: BusinessProfileJson): Record<string, string> {
    return {
      business_name: businessProfile.brand_voice.split(':')[0] || 'Business',
      services: businessProfile.services?.join(', ') || 'General services',
      hours: businessProfile.hours ? JSON.stringify(businessProfile.hours) : 'Contact for hours',
      pricing_notes: businessProfile.pricing_notes?.join(', ') || 'Contact for pricing',
      faq_questions: businessProfile.faqs?.join(' | ') || '',
      qualifying_questions: businessProfile.qualifying_questions?.join(' | ') || '',
      prohibited_claims: businessProfile.prohibited_claims?.join(', ') || '',
      coverage_area: businessProfile.coverage_area || 'Local area',
    };
  }
}