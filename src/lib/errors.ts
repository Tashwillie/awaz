export class BadRequestError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class ProviderError extends Error {
  constructor(message: string, public provider: string, public statusCode = 500) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  return 'An unknown error occurred';
}







