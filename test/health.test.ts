import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthGet } from '../app/api/health/route';

describe('Health API Route', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it('should return health status with version', async () => {
    const response = await healthGet();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      version: expect.any(String),
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
    
    expect(data.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    expect(data.requestId).toHaveLength(36);
  });

  it('should include request ID in response', async () => {
    const response = await healthGet();
    const data = await response.json();
    
    expect(data.requestId).toBeDefined();
    expect(typeof data.requestId).toBe('string');
    expect(data.requestId.length).toBeGreaterThan(0);
  });

  it('should return valid timestamp', async () => {
    const before = new Date();
    const response = await healthGet();
    const data = await response.json();
    const after = new Date();
    
    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
