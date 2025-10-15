import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as webhookPost } from '../app/api/voice/webhooks/route';
import { getActiveProvider } from '../src/services/providers/voice/register';
import { PrismaClient } from '@prisma/client';
import { ProviderEventSchema } from '../src/types/webhook';

vi.mock('../src/services/providers/voice/register');
vi.mock('@prisma/client');
const MockedGetActiveProvider = vi.mocked(getActiveProvider);
const MockedPrismaClient = vi.mocked(PrismaClient);

describe('Voice Webhooks API Route', () => {
  let mockVoiceProvider: any;
  let mockPrismaClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/funnder_test';
    process.env.LOG_LEVEL = 'error';
    process.env.VOICE_PROVIDER = 'retell';

    mockVoiceProvider = {
      startCall: vi.fn(),
      verifyWebhook: vi.fn(),
      parseEvent: vi.fn(),
    };

    mockPrismaClient = {
      webhookEvent: {
        upsert: vi.fn(),
      },
      call: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      demoSession: {
        update: vi.fn(),
      },
    };

    MockedGetActiveProvider.mockReturnValue(mockVoiceProvider);
    MockedPrismaClient.mockImplementation(() => mockPrismaClient);
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.LOG_LEVEL;
    delete process.env.VOICE_PROVIDER;
  });

  it('should process webhook and update call status', async () => {
    const webhookPayload = {
      call_id: 'retell-call-123',
      event: 'call_ended',
      timestamp: 1234567890,
      end_state: 'ended_by_user',
      transcript: 'Customer called about plumbing issue.',
      analysis: {
        summary: 'Plumbing service inquiry',
      },
    };

    const parsedEvent = {
      provider: 'retell',
      providerCallId: 'retell-call-123',
      sessionId: 'session-123',
      event: 'call_ended',
      status: 'COMPLETED',
      timestamp: '2023-07-20T12:00:00.000Z',
      summary: 'Plumbing service inquiry',
      transcript: 'Customer called about plumbing issue.',
      transcriptUrl: undefined,
      metadata: {},
    };

    mockVoiceProvider.verifyWebhook.mockResolvedValue(true);
    mockVoiceProvider.parseEvent.mockResolvedValue(parsedEvent);

    mockPrismaClient.call.findFirst.mockResolvedValue({
      id: 'call-db-123',
      demoSessionId: 'session-123',
      provider: 'retell',
      providerCallId: 'retell-call-123',
    });

    mockPrismaClient.webhookEvent.upsert.mockResolvedValue({
      id: 'webhook-event-123',
    });

    mockPrismaClient.demoSession.update.mockResolvedValue({
      id: 'session-123',
    });

    const request = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-retell-signature': 'fake-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    const response = await webhookPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockVoiceProvider.verifyWebhook).toHaveBeenCalled();
    expect(mockVoiceProvider.parseEvent).toHaveBeenCalledWith(webhookPayload);
    expect(mockPrismaClient.webhookEvent.upsert).toHaveBeenCalled();
    expect(mockPrismaClient.call.update).toHaveBeenCalled();
    expect(mockPrismaClient.demoSession.update).toHaveBeenCalled();
  });

  it('should handle idempotent webhook processing', async () => {
    const webhookPayload = {
      call_id: 'retell-call-duplicate',
      event: 'call_ended',
      timestamp: 1234567890,
      end_state: 'ended_by_user',
      transcript: 'Customer inquiry about heating.',
      analysis: {
        summary: 'Heating service inquiry',
      },
    };

    const parsedEvent = {
      provider: 'retell',
      providerCallId: 'retell-call-duplicate',
      sessionId: 'session-duplicate',
      event: 'call_ended',
      status: 'COMPLETED',
      timestamp: '2023-07-20T13:00:00.000Z',
      summary: 'Heating service inquiry',
      transcript: 'Customer inquiry about heating.',
      transcriptUrl: undefined,
      metadata: {},
    };

    mockVoiceProvider.verifyWebhook.mockResolvedValue(true);
    mockVoiceProvider.parseEvent.mockResolvedValue(parsedEvent);

    mockPrismaClient.call.findFirst.mockResolvedValue({
      id: 'call-db-duplicate',
      demoSessionId: 'session-duplicate',
      provider: 'retell',
      providerCallId: 'retell-call-duplicate',
    });

    // Simulate duplicate webhook event
    mockPrismaClient.webhookEvent.upsert.mockResolvedValue({
      id: 'webhook-event-duplicate',
    });

    mockPrismaClient.demoSession.update.mockResolvedValue({
      id: 'session-duplicate',
    });

    // Process the same webhook twice
    const request = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-retell-signature': 'fake-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    // First call
    const response1 = await webhookPost(request);
    expect(response1.status).toBe(200);

    // Second call (should be idempotent)
    const response2 = await webhookPost(request);
    expect(response2.status).toBe(200);

    // Verify upsert was called both times
    expect(mockPrismaClient.webhookEvent.upsert).toHaveBeenCalledTimes(2);
  });

  it('should return 401 for invalid signature', async () => {
    mockVoiceProvider.verifyWebhook.mockResolvedValue(false);

    const request = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-retell-signature': 'invalid-signature',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    const response = await webhookPost(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid signature');
  });

  it('should return 404 if call not found', async () => {
    const webhookPayload = {
      call_id: 'nonexistent-call',
      event: 'call_ended',
      timestamp: 1234567890,
    };

    mockVoiceProvider.verifyWebhook.mockResolvedValue(true);
    mockVoiceProvider.parseEvent.mockResolvedValue({
      provider: 'retell',
      providerCallId: 'nonexistent-call',
      sessionId: '',
      event: 'call_ended',
      status: 'COMPLETED',
      timestamp: '2023-07-20T12:00:00.000Z',
    });

    mockPrismaClient.call.findFirst.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-retell-signature': 'fake-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    const response = await webhookPost(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Call not found');
  });

  it('should skip signature verification in test mode', async () => {
    mockVoiceProvider.verifyWebhook.mockResolvedValue(true);
    mockVoiceProvider.parseEvent.mockResolvedValue({
      provider: 'retell',
      providerCallId: 'retell-call-test',
      sessionId: 'session-test',
      event: 'call_started',
      status: 'IN_PROGRESS',
      timestamp: '2023-07-LOG_LEVEL === 'error',
    });

    mockPrismaClient.call.findFirst.mockResolvedValue({
      id: 'call-db-test',
      demoSessionId: 'session-test',
      provider: 'retell',
      providerCallId: 'retell-call-test',
    });

    mockPrismaClient.webhookEvent.upsert.mockResolvedValue({
      id: 'webhook-event-test',
    });

    const request = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // No signature header
      },
      body: JSON.stringify({
        call_id: 'retell-call-test',
        event: 'call_started',
        timestamp: 1234567890,
      }),
    });

    const response = await webhookPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});





