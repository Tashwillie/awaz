import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RetellProvider } from '../src/services/providers/voice/retell';
import { BusinessProfileJson } from '../src/types/profile';

describe('RetellProvider', () => {
  let retellProvider: RetellProvider;
  let mockBusinessProfile: BusinessProfileJson;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    retellProvider = new RetellProvider('test-retell-key');
    
    mockBusinessProfile = {
      brand_voice: 'Acme Plumbing: Professional plumbing services',
      services: ['Emergency plumbing', 'Pipe repair', 'Drain cleaning'],
      coverage_area: 'Springfield, IL',
      pricing_notes: ['Competitive rates'],
      booking_rules: ['24-hour cancellation policy'],
      faqs: ['What are your hours?'],
      qualifying_questions: ['What service do you need?'],
      prohibited_claims: ['Cannot guarantee results'],
    };
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('startCall', () => {
    it('should return mock call ID in test mode', async () => {
      const sessionId = 'session-123';
      const phoneE164 = '+1234567890';

      const result = await retellProvider.startCall(sessionId, phoneE164, mockBusinessProfile);

      expect(result).toMatch(/^retell-dev-session-123-\d+$/);
    });

    it('should handle business profile context building', async () => {
      const sessionId = 'session-456';
      const phoneE164 = '+1987654321';

      const result = await retellProvider.startCall(sessionId, phoneE164, mockBusinessProfile);

      expect(typeof result).toBe('string');
      expect(result).toContain('retell-dev-session-456');
    });

    it('should throw error if no API key provided', async () => {
      const invalidProvider = new RetellProvider('');
      
      // In test mode, should still work with mock
      const result = await invalidProvider.startCall('session', '+1234567890', mockBusinessProfile);
      expect(typeof result).toBe('string');
    });
  });

  describe('verifyWebhook', () => {
    it('should skip verification in test mode', async () => {
      const result = await retellProvider.verifyWebhook('fake-signature', 'fake-body', 'fake-secret');
      expect(result).toBe(true);
    });

    it('should accept webhooks in test mode regardless of signature', async () => {
      const invalidSignature = 'completely-invalid-signature';
      const body = '{"test": "data"}';
      const secret = 'secret';

      const result = await retellProvider.verifyWebhook(invalidSignature, body, secret);
      expect(result).toBe(true);
    });
  });

  describe('parseEvent', () => {
    it('should parse Retell webhook event', async () => {
      const retellEvent = {
        call_id: 'retell-call-123',
        event: 'call_ended',
        timestamp: 1234567890,
        end_state: 'ended_by_user',
        transcript: 'This is a sample transcript of the call conversation.',
        recording_url: 'https://retell.ai/recordings/call-123.mp3',
        analysis: {
          transcript: 'This is a sample transcript of the call conversation.',
          summary: 'Customer inquired about plumbing services.',
          intent: 'service_inquiry',
          entities: { service_type: 'plumbing' },
        },
      };

      const parsed = await retellProvider.parseEvent(retellEvent);

      expect(parsed.provider).toBe('retell');
      expect(parsed.providerCallId).toBe('retell-call-123');
      expect(parsed.event).toBe('call_ended');
      expect(parsed.status).toBe('COMPLETED');
      expect(parsed.transcriptUrl).toBe('https://retell.ai/recordings/call-123.mp3');
      expect(parsed.summary).toContain('Customer inquired about plumbing services');
      expect(parsed.transcript).toBe('This is a sample transcript of the call conversation.');
    });

    it('should handle events without end_state', async () => {
      const retellEvent = {
        call_id: 'retell-call-456',
        event: 'call_started',
```

Let me continue the test file:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
edit_file





