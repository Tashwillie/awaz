import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as placesGet } from '../app/api/places/search/route';
import { PlacesService } from '../src/services/places.service';

// Mock the PlacesService
vi.mock('../src/services/places.service');
const MockedPlacesService = vi.mocked(PlacesService);

describe('Places API Route', () => {
  let mockPlacesService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/funnder_test';
    process.env.LOG_LEVEL = 'error';
    
    mockPlacesService = {
      searchPlaces: vi.fn()
    };
    MockedPlacesService.mockImplementation(() => mockPlacesService);
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.LOG_LEVEL;
  });

  it('should return places search results', async () => {
    const mockResults = [
      {
        place_id: 'place1',
        name: 'Acme Restaurant',
        address: '123 Main St, Springfield, IL',
        website: 'https://acme.com',
        phone: '+1234567890',
        types: ['restaurant', 'food'],
        rating: 4.5,
        user_ratings_total: 100,
        geo: { lat: 40.123, lng: -89.456 }
      }
    ];

    mockPlacesService.searchPlaces.mockResolvedValue(mockResults);

    const request = new NextRequest('http://localhost/api/places/search?q=Acme&city=Springfield&country=USA');
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual(mockResults);
    expect(data.requestId).toBeDefined();
    expect(mockPlacesService.searchPlaces).toHaveBeenCalledWith('Acme', 'Springfield', 'USA');
  });

  it('should validate required query parameter', async () => {
    const request = new NextRequest('http://localhost/api/places/search?city=Springfield');
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('q: Required');
    expect(data.requestId).toBeDefined();
  });

  it('should validate query length', async () => {
    const longQuery = 'a'.repeat(101);
    const request = new NextRequest(`http://localhost/api/places/search?q=${longQuery}`);
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('q: Query too long');
  });

  it('should validate city length', async () => {
    const longCity = 'a'.repeat(51);
    const request = new NextRequest(`http://localhost/api/places/search?q=Acme&city=${longCity}`);
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('city: City name too long');
  });

  it('should validate country length', async () => {
    const longCountry = 'a'.repeat(51);
    const request = new NextRequest(`http://localhost/api/places/search?q=Acme&country=${longCountry}`);
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toContain('country: Country name too long');
  });

  it('should handle places service errors', async () => {
    const error = new Error('Google Places API error: OVER_QUERY_LIMIT');
    error.name = 'ProviderError';
    mockPlacesService.searchPlaces.mockRejectedValue(error);

    const request = new NextRequest('http://localhost/api/places/search?q=Acme');
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.requestId).toBeDefined();
  });

  it('should handle timeout errors', async () => {
    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'ProviderError';
    mockPlacesService.searchPlaces.mockRejectedValue(timeoutError);

    const request = new NextRequest('http://localhost/api/places/search?q=Acme');
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.requestId).toBeDefined();
  });

  it('should handle empty query parameters gracefully', async () => {
    const mockResults = [];
    mockPlacesService.searchPlaces.mockResolvedValue(mockResults);

    const request = new NextRequest('http://localhost/api/places/search?q=Acme');
    const response = await placesGet(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([]);
    expect(mockPlacesService.searchPlaces).toHaveBeenCalledWith('Acme', undefined, undefined);
  });
});
