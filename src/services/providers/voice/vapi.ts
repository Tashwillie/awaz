import { VoiceProvider } from '@/types/webhook';
import { ProviderEvent } from '@/types/webhook';
import { logger } from '@/lib/logger';
import { ProviderError } from '@/lib/errors';
import { getEnv } from '@/lib/env';
import { BusinessProfileJson } from '@/types/profile';

interface VapiCallRequest {
  phoneNumberId: string;
  assistantId: string;
  customer: {
    number: string;
  };
  assistantOverrides?: {
    firstMessage?: string;
    voicemailDetection?: boolean;
    backgroundSound?: string;
    maxDurationSeconds?: number;
  };
  assistantConfig?: {
    model?: {
      provider: string;
      model: string;
      temperature?: number;
      maxTokens?: number;
    };
    voice?: {
      provider: string;
      voiceId: string;
    };
    firstMessage?: string;
    systemMessage?: string;
  };
}

interface VapiCallResponse {
  id: string;
  status: string;
  phoneNumberId: string;
  customer: {
    number: string;
  };
  assistantId: string;
}

interface VapiWebhookEvent {
  type: string;
  call: {
    id: string;
    status: string;
    endedReason?: string;
    transcript?: string;
    recordingUrl?: string;
    analysis?: {
      summary?: string;
      sentiment?: string;
      topics?: string[];
    };
    messages?: Array<{
      role: string;
      message: string;
      time: number;
    }>;
  };
  timestamp: number;
}

export class VapiProvider implements VoiceProvider {
  private apiKey: string;
  private baseUrl = 'https://api.vapi.ai';

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
    logger.info('Starting Vapi call', { sessionId, phoneNumberE164 });

    try {
      // Use predefined assistantId or default
      const effectiveAssistantId = agentId || 'asst-default';
      
      const callRequest: VapiCallRequest = {
        phoneNumberId: 'phone-default', // In production, use real phone number ID
        assistantId: effectiveAssistantId,
        customer: {
          number: phoneNumberE164,
        },
        assistantOverrides: {
          firstMessage: `Hello! I'm calling from ${businessProfile.brand_voice.split(':')[0] || 'our business'}. How can I help you today?`,
          voicemailDetection: true,
          maxDurationSeconds: 300, // 5 minutes max
        },
        assistantConfig: {
          model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000,
          },
          voice: {
            provider: 'elevenlabs',
            voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice
          },
          systemMessage: this.buildSystemMessage(businessProfile),
        },
      };

      // In development/test mode, return fake call ID to avoid real API calls
      if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
        const mockCallId = `vapi-dev-${sessionId}-${Date.now()}`;
        logger.info('Using mock Vapi call ID for dev/test', { callId: mockCallId });
        return mockCallId;
      }

      const response = await fetch(`${this.baseUrl}/call`, {
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
          `Vapi API error: ${response.status} ${response.statusText} - ${errorText}`,
          'vapi',
          response.status
        );
      }

      const data: VapiCallResponse = await response.json();
      const callId = data.id;

      if (!callId) {
        throw new ProviderError('No call ID returned from Vapi API', 'vapi', 500);
      }

      logger.info('Vapi call started successfully', { callId, sessionId });
      return callId;
    } catch (error) {
      logger.error('Vapi startCall failed', {
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
        logger.warn('Skipping Vapi webhook signature verification in dev/test mode');
        return true;
      }

      // TODO: Implement actual Vapi webhook signature verification
      // Vapi typically uses HMAC-SHA256 with a webhook secret
      logger.warn('Vapi webhook signature verification not yet implemented - accepting all');
      return true;
    } catch (error) {
      logger.error('Vapi webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async parseEvent(payload: VapiWebhookEvent): Promise<ProviderEvent> {
    logger.info('Parsing Vapi event', { 
      callId: payload.call.id,
      type: payload.type,
      status: payload.call.status
    });

    try {
      // Map Vapi event status to our normalized status
      const getCallStatus = (status: string, endedReason?: string) => {
        switch (status) {
          case 'completed':
            return 'COMPLETED';
          case 'failed':
            return 'FAILED';
          case 'in-progress':
            return 'IN_PROGRESS';
          case 'queued':
            return 'QUEUED';
          default:
            return status.toUpperCase().replace(/[^A-Z_]/g, '_');
        }
      };

      // Extract transcript from messages if available
      let transcript = payload.call.transcript || '';
      if (!transcript && payload.call.messages) {
        transcript = payload.call.messages
          .map(msg => `${msg.role}: ${msg.message}`)
          .join('\n');
      }

      return {
        provider: 'vapi',
        providerCallId: payload.call.id,
        sessionId: '', // Will be populated from DB lookup
        event: payload.type,
        status: getCallStatus(payload.call.status, payload.call.endedReason),
        timestamp: new Date(payload.timestamp).toISOString(),
        summary: payload.call.analysis?.summary || transcript.substring(0, 500),
        transcriptUrl: payload.call.recordingUrl,
        transcript: transcript,
        metadata: {
          status: payload.call.status,
          endedReason: payload.call.endedReason,
          analysis: payload.call.analysis,
          messageCount: payload.call.messages?.length || 0,
        },
      };
    } catch (error) {
      logger.error('Failed to parse Vapi event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        payload: JSON.stringify(payload).substring(0, 200),
      });
      throw new ProviderError('Failed to parse Vapi webhook event', 'vapi', 400);
    }
  }

  private buildSystemMessage(businessProfile: BusinessProfileJson): string {
    const businessName = businessProfile.brand_voice.split(':')[0] || 'our business';
    const services = businessProfile.services?.join(', ') || 'general services';
    const coverageArea = businessProfile.coverage_area || 'the local area';

    return `You are a professional AI assistant calling on behalf of ${businessName}.

Business Information:
- Services: ${services}
- Coverage Area: ${coverageArea}
- Brand Voice: ${businessProfile.brand_voice}

Guidelines:
- Be professional and helpful
- Ask qualifying questions to understand customer needs
- Provide relevant information about our services
- If appropriate, offer to schedule a consultation or service
- Keep the conversation focused and concise
- Be polite and respectful at all times

${businessProfile.qualifying_questions?.length ? `Sample questions to ask: ${businessProfile.qualifying_questions.join(', ')}` : ''}

${businessProfile.prohibited_claims?.length ? `Things to avoid: ${businessProfile.prohibited_claims.join(', ')}` : ''}`;
  }
}