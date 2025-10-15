import { NextRequest } from 'next/server';
import { RateLimitError } from './errors';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest): void => {
    const ip = getClientIP(request);
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    
    const existing = rateLimitStore.get(key);
    
    if (!existing || now > existing.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return;
    }
    
    if (existing.count >= config.maxRequests) {
      throw new RateLimitError();
    }
    
    existing.count++;
    rateLimitStore.set(key, existing);
  };
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupRateLimitStore, 60000);







