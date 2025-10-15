import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as receiveCallPost } from '../app/api/demo/receive-call/route';
import { getActiveProvider } from '../src/services/providers/voice/register';
import { PrismaClient } from '@prisma/client';

vi.mock('../src/services/providers/voice/register');
vi.mock('@prisma/client');
const MockedGetActiveProvider = vi.mocked(getActiveProvider);
const MockedPrismaClient = vi.mocked(PrismaClient);

const mockBusinessProfile = {
  brand_voice: 'Acme Plumbing: Professional plumbing services',
  services: ['Emergency plumbing', 'Pipe repair'],
  coverage_area: 'Springfield, IL',
  pricing_notes: ['Competitive rates'],
  booking_rules: ['24-hour cancellation policy'],
  faqs: ['What are your hours?'],
  qualifying_questions: ['What service do you need?'],
  prohibited_claims: ['Cannot guarantee results'],
};

describe('Receive Call API Route', () => {
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
      demoSession: {
        findUnique: vi.fn(),
      },
      call: {
        create: vi.fn(),
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

  it('should create call and return call ID', async () => {
    const sessionId = 'session-123';
    const phoneE164 = '+1234567890';
    
    mockPrismaClient.demoSession.findUnique.mockResolvedValue({
      id: sessionId,
      businessProfile: {
        json: mockBusinessProfile,
      },
      lead: {
        phoneE164,
      },
    });

    mockVoiceProvider.startCall.mockResolvedValue('retell-call-dev123');

    mockPrismaClient.call.create.mockResolvedValue({
      id: 'call-db-123',
      demoSessionId: sessionId,
      provider: 'retell',
      providerCallId: 'retell-call-dev123',
      status: 'INITIATED',
    });

    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        phone_e164: phoneE164,
      }),
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.callId).toBeDefined();
    expect(data.requestId).toBeDefined();
    expect(mockVoiceProvider.startCall).toHaveBeenCalledWith(
      sessionId,
      phoneE164,
      mockBusinessProfile
    );
  });

  it('should validate E164 phone format', async () => {
    const sessionId = 'session-invalid';
    const invalidPhone = 'invalid-phone';

    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        phone_e164: invalidPhone,
      }),
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('phone_e164: Invalid E164 format');
  });

  it('should require sessionId', async () => {
    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        phone_e164: '+1234567890',
      }),
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('sessionId: Required');
  });

  it('should return 404 if demo session not found', async () => {
    mockPrismaClient.demoSession.findUnique.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'nonexistent-session',
        phone_e164: '+1234567890',
      }),
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Demo session not found');
  });

  it('should return 400 if business profile missing', async () => {
    mockPrismaClient.demoSession.findUnique.mockResolvedValue({
      id: 'session-123',
      businessProfile: null,
    });

    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        phone_e164: '+1234567890',
      }),
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Business profile not found for session');
  });

  it('should handle voice provider errors', async () => {
    mockPrismaClient.demoSession.findUnique.mockResolvedValue({
      id: 'session-123',
      businessProfile: {
        json: mockBusinessProfile,
      },
    });

    mockVoiceProvider.startCall.mockRejectedValue(new Error('Provider API error'));

    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-error',
        phone_e164: '+1234567890',
      }),
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should skip Turnstile verification in test mode', async () => {
    mockPrismaClient.demoSession.findUnique.mockResolvedValue({
      id: 'session-test',
      businessProfile: {
        json: mockBusinessProfile,
      },
    });

    mockVoiceProvider.startCall.mockResolvedValue('retell-call-test123');

    mockPrismaClient.call.create.mockResolvedValue({
      id: 'call-test-123',
      demoSessionId: 'session-test',
      provider: 'retell',
      providerCallId: 'retell-call-test123',
      status: 'INITIATED',
    });

    const request = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-test',
        phone_e164: '+1234567890',
      }),
      // No Turnstile token header
    });

    const response = await receiveCallPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.callId).toBeDefined();
    // Verify Turnstile was skipped (no 401 error)
  });
});