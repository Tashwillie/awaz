import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { NextRequest } from 'next/server';
import { GET as healthGet } from '@/app/api/health/route';
import { GET as placesGet } from '@/app/api/places/search/route';
import { POST as demoStartPost } from '@/app/api/demo/start/route';
import { POST as demoConfirmPost } from '@/app/api/demo/confirm/route';
import { POST as receiveCallPost } from '@/app/api/demo/receive-call/route';

describe('Demo E2E Tests', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/funnder_test';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
  });

  it('should return health status', async () => {
    const response = await healthGet();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.requestId).toBeDefined();
  });

  it('should search places', async () => {
    const mockRequest = new NextRequest('http://localhost/api/places/search?q=plumber');
    
    const response = await placesGet(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.results).toBeDefined();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.requestId).toBeDefined();
  });

  it('should start demo session', async () => {
    const mockRequest = new NextRequest('http://localhost/api/demo/start', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    const response = await demoStartPost(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
    expect(data.requestId).toBeDefined();
  });

  it('should confirm demo session', async () => {
    const mockRequest = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session-id',
        placeId: 'test-place-id',
        phoneE164: '+1234567890',
        consent: true,
      }),
    });
    
    const response = await demoConfirmPost(mockRequest);
    
    expect(response.status).toBe(500);
  });

  it('should handle receive call', async () => {
    const mockRequest = new NextRequest('http://localhost/api/demo/receive-call', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session-id',
      }),
    });
    
    const response = await receiveCallPost(mockRequest);
    
    expect(response.status).toBe(500);
  });
});







