import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlacesService } from '../src/services/places.service';
import { BadRequestError, ProviderError } from '../src/lib/errors';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PlacesService', () => {
  let placesService: PlacesService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_PLACES_API_KEY = 'test-api-key';
    placesService = new PlacesService();
  });

  afterEach(() => {
    delete process.env.GOOGLE_PLACES_API_KEY;
  });

  describe('searchPlaces', () => {
    it('should return up to 3 places on successful search', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'place1',
            name: 'Acme Restaurant',
            formatted_address: '123 Main St, Springfield, IL',
            website: 'https://acme.com',
            formatted_phone_number: '+1234567890',
            types: ['restaurant', 'food'],
            rating: 4.5,
            user_ratings_total: 100,
            geometry: {
              location: { lat: 40.123, lng: -89.456 }
            }
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const results = await placesService.searchPlaces('Acme', 'Springfield', 'USA');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        place_id: 'place1',
        name: 'Acme Restaurant',
        address: '123 Main St, Springfield, IL',
        website: 'https://acme.com',
        phone: '+1234567890',
        types: ['restaurant', 'food'],
        rating: 4.5,
        user_ratings_total: 100,
        geo: { lat: 40.123, lng: -89.456 }
      });
    });

    it('should handle Google Places API errors', async () => {
      const mockResponse = {
        status: 'OVER_QUERY_LIMIT',
        error_message: 'You have exceeded your daily quota'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(placesService.searchPlaces('Acme'))
        .rejects
        .toThrow(ProviderError);
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Request timeout');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      await expect(placesService.searchPlaces('Acme'))
        .rejects
        .toThrow(ProviderError);
    });

    it('should retry on 429 errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'OK',
            results: [{
              place_id: 'place1',
              name: 'Acme Restaurant',
              formatted_address: '123 Main St',
              types: ['restaurant']
            }]
          })
        });

      const results = await placesService.searchPlaces('Acme');

      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors with retry', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'OK',
            results: [{
              place_id: 'place1',
              name: 'Acme Restaurant',
              formatted_address: '123 Main St',
              types: ['restaurant']
            }]
          })
        });

      const results = await placesService.searchPlaces('Acme');

      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(placesService.searchPlaces('Acme'))
        .rejects
        .toThrow(ProviderError);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPlaceDetails', () => {
    it('should return place details on successful request', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          place_id: 'place1',
          name: 'Acme Restaurant',
          formatted_address: '123 Main St, Springfield, IL',
          website: 'https://acme.com',
          formatted_phone_number: '+1234567890',
          types: ['restaurant', 'food'],
          rating: 4.5,
          user_ratings_total: 100,
          geometry: {
            location: { lat: 40.123, lng: -89.456 }
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await placesService.getPlaceDetails('place1');

      expect(result).toEqual({
        place_id: 'place1',
        name: 'Acme Restaurant',
        address: '123 Main St, Springfield, IL',
        website: 'https://acme.com',
        phone: '+1234567890',
        types: ['restaurant', 'food'],
        rating: 4.5,
        hours: undefined,
        reviews_sample: [],
        geo: { lat: 40.123, lng: -89.456 }
      });
    });

    it('should handle place not found', async () => {
      const mockResponse = {
        status: 'OK',
        results: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(placesService.getPlaceDetails('nonexistent'))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should handle Google Places API errors', async () => {
      const mockResponse = {
        status: 'INVALID_REQUEST',
        error_message: 'Invalid place_id'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(placesService.getPlaceDetails('invalid'))
        .rejects
        .toThrow(ProviderError);
    });
  });

  describe('constructor', () => {
    it('should throw error if API key is missing', async () => {
      const originalEnv = process.env.GOOGLE_PLACES_API_KEY;
      delete process.env.GOOGLE_PLACES_API_KEY;
      
      // Clear the cached env
      const { getEnv } = await import('../src/lib/env');
      (getEnv as any).env = undefined;
      
      expect(() => new PlacesService())
        .toThrow('GOOGLE_PLACES_API_KEY is required');
        
      process.env.GOOGLE_PLACES_API_KEY = originalEnv;
    });
  });
});