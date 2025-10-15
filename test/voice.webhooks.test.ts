import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as webhookPost } from '@/app/api/voice/webhooks/route';
import { RetellProvider } from '@/services/providers/voice/retell';
import { VapiProvider } from '@/services/providers/voice/vapi';
import { AwazProvider } from '@/services/providers/voice/awaz';

vi.mock('@/services/providers/voice', () => ({
  getActiveProvider: vi.fn(),
}));

describe('Voice Webhooks Tests', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/funnder_test';
  });

  it('should handle Retell webhook', async () => {
    const retellProvider = new RetellProvider('test-key');
    
    const mockRequest = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'x-retell-signature': 'test-signature',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'call_completed',
        call_id: 'test-call-id',
        metadata: {
          phone_number: '+1234567890',
          lead_name: 'Test User',
        },
        summary: 'Call completed successfully',
      }),
    });
    
    const response = await webhookPost(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestId).toBeDefined();
  });

  it('should handle Vapi webhook', async () => {
    const vapiProvider = new VapiProvider('test-key');
    
    const mockRequest = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'x-vapi-signature': 'test-signature',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'call-completed',
        call: {
          id: 'test-call-id',
          customer: {
            number: '+1234567890',
            name: 'Test User',
          },
          summary: 'Call completed successfully',
        },
      }),
    });
    
    const response = await webhookPost(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestId).toBeDefined();
  });

  it('should handle Awaz webhook', async () => {
    const awazProvider = new AwazProvider('test-key');
    
    const mockRequest = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'x-awaz-signature': 'test-signature',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        event: 'call_completed',
        call_id: 'test-call-id',
        customer: {
          phone: '+1234567890',
          name: 'Test User',
        },
        summary: 'Call completed successfully',
      }),
    });
    
    const response = await webhookPost(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestId).toBeDefined();
  });

  it('should reject invalid webhook signature', async () => {
    const mockRequest = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'call_completed',
        call_id: 'test-call-id',
      }),
    });
    
    const response = await webhookPost(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid webhook signature');
  });

  it('should handle malformed JSON', async () => {
    const mockRequest = new NextRequest('http://localhost/api/voice/webhooks', {
      method: 'POST',
      headers: {
        'x-retell-signature': 'test-signature',
        'content-type': 'application/json',
      },
      body: 'invalid json',
    });
    
    const response = await webhookPost(mockRequest);
    
    expect(response.status).toBe(500);
  });
});







