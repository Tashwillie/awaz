import { z } from 'zod';
import { BusinessProfileJson } from './profile';

export const ProviderEventSchema = z.object({
  provider: z.string(),
  providerCallId: z.string(),
  sessionId: z.string(),
  event: z.string(),
  status: z.string(),
  timestamp: z.string(),
  summary: z.string().optional(),
  transcriptUrl: z.string().optional(),
  transcript: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ProviderEvent = z.infer<typeof ProviderEventSchema>;

export interface VoiceProvider {
  startCall(
    sessionId: string,
    phoneNumberE164: string,
    businessProfile: BusinessProfileJson,
    agentId?: string
  ): Promise<string>;
  verifyWebhook(signature: string, body: string, secret: string): Promise<boolean>;
  parseEvent(payload: any): Promise<ProviderEvent>;
}


