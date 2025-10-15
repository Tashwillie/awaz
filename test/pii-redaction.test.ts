import { describe, it, expect } from 'vitest';
import { redactPII } from '../src/lib/logger';

describe('PII Redaction', () => {
  it('should redact phone numbers', () => {
    const input = 'Call user at 555-123-4567 or 1234567890';
    const result = redactPII(input);
    
    expect(result).toBe('Call user at [PHONE] or [PHONE]');
    expect(result).not.toContain('555-123-4567');
    expect(result).not.toContain('1234567890');
  });

  it('should redact email addresses', () => {
    const input = 'Contact john.doe@example.com or admin@company.org';
    const result = redactPII(input);
    
    expect(result).toBe('Contact [EMAIL] or [EMAIL]');
    expect(result).not.toContain('john.doe@example.com');
    expect(result).not.toContain('admin@company.org');
  });

  it('should redact both phone and email', () => {
    const input = 'User info: john@test.com, phone: 555-987-6543';
    const result = redactPII(input);
    
    expect(result).toBe('User info: [EMAIL], phone: [PHONE]');
    expect(result).not.toContain('john@test.com');
    expect(result).not.toContain('555-987-6543');
  });

  it('should leave non-PII text unchanged', () => {
    const input = 'This is normal text without sensitive information';
    const result = redactPII(input);
    
    expect(result).toBe(input);
  });

  it('should handle empty string', () => {
    const result = redactPII('');
    expect(result).toBe('');
  });
});
