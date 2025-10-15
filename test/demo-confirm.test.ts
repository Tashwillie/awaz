import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as demoConfirmPost } from '../app/api/demo/confirm/route';
import { PlacesService } from '../src/services/places.service';
import { ProfileBuilderService } from '../src/services/profile-builder.service';

vi.mock('../src/services/places.service');
vi.mock('../src/services/profile-builder.service');
const MockedPlacesService = vi.mocked(PlacesService);
const MockedProfileBuilderService = vi.mocked(ProfileBuilderService);

describe('Demo Confirm API Route', () => {
  let mockPlacesService: any;
  let mockProfileBuilderService: any;

  const mockBusinessContext = {
    place_id: 'place123',
    name: 'Acme Plumbing',
    address: '123 Main St, Springfield, IL',
    website: 'https://acmeplumbing.com',
    phone: '+1234567890',
    types: ['plumber', 'home_services'],
    rating: 4.5,
    hours: undefined,
    reviews_sample: [],
    geo: { lat: 40.123, lng: -89.456 }
  };

  const mockBusinessProfile = {
    brand_voice: 'Professional plumbing services',
    services: ['Emergency plumbing', 'Pipe repair'],
    coverage_area: 'Springfield, IL',
    pricing_notes: ['Competitive rates'],
    booking_rules: ['24-hour cancellation'],
    faqs: ['What are your hours?'],
    qualifying_questions: ['What service do you need?'],
    prohibited_claims: ['Cannot guarantee results']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/funnder_test';
    process.env.LOG_LEVEL = 'error';
    
    mockPlacesService = {
      getPlaceDetails: vi.fn()
    };
    
    mockProfileBuilderService = {
      buildProfile: vi.fn()
    };
    
    MockedPlacesService.mockImplementation(() => mockPlacesService);
    MockedProfileBuilderService.mockImplementation(() => mockProfileBuilderService);
    
    mockPlacesService.getPlaceDetails.mockResolvedValue(mockBusinessContext);
    mockProfileBuilderService.buildProfile.mockResolvedValue(mockBusinessProfile);
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.LOG_LEVEL;
  });

  it('should confirm demo session and return business profile', async () => {
    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'place123',
        phoneE164: '+1234567890',
        consent: true
      }),
    });

    const response = await demoConfirmPost(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(mockPlacesService.getPlaceDetails).toHaveBeenCalledWith('place123');
    expect(mockProfileBuilderService.buildProfile).toHaveBeenCalledWith(mockBusinessContext, {});
  });

  it('should include website excerpt and FAQs in profile building', async () => {
    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'place123',
        phoneE164: '+1234567890',
        websiteExcerpt: 'We offer 24/7 emergency services',
        faqs: ['What is your emergency rate?']
      }),
    });

    await demoConfirmPost(request);

    expect(mockProfileBuilderService.buildProfile).toHaveBeenCalledWith(
      mockBusinessContext,
      {
        websiteExcerpt: 'We offer 24/7 emergency services',
        edits: undefined,
        faqs: ['What is your emergency rate?']
      }
    );
  });

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'place123'
      }),
    });

    const response = await demoConfirmPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('phoneE164: Required');
  });

  it('should validate email format', async () => {
    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'place123',
        phoneE164: '+1234567890',
        email: 'invalid-email'
      }),
    });

    const response = await demoConfirmPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('email: Invalid email');
  });

  it('should handle places service errors', async () => {
    mockPlacesService.getPlaceDetails.mockRejectedValue(
      new Error('Place not found')
    );

    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'invalid-place',
        phoneE164: '+1234567890'
      }),
    });

    const response = await demoConfirmPost(request);
    
    expect(response.status).toBe(500);
  });

  it('should handle profile builder errors', async () => {
    mockProfileBuilderService.buildProfile.mockRejectedValue(
      new Error('Profile building failed')
    );

    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'place123',
        phoneE164: '+1234567890'
      }),
    });

    const response = await demoConfirmPost(request);
    
    expect(response.status).toBe(500);
  });

  it('should include request ID in response', async () => {
    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-123',
        placeId: 'place123',
        phoneE164: '+1234567890'
      }),
    });

    const response = await demoConfirmPost(request);
    const data = await response.json();

    expect(data.requestId).toBeDefined();
    expect(typeof data.requestId).toBe('string');
  });

  it('should handle malformed JSON in request', async () => {
    const request = new NextRequest('http://localhost/api/demo/confirm', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await demoConfirmPost(request);
    
    expect(response.status).toBe(500);
  });
});
