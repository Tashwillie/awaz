import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { BadRequestError, ProviderError } from '@/lib/errors';
import { BusinessContext } from '@/types/profile';

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  address: string;
  website?: string;
  phone?: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  geo?: {
    lat: number;
    lng: number;
  };
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GooglePlacesResponse {
  status: string;
  results: GooglePlaceResult[];
  error_message?: string;
}

export class PlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private timeout = 1500;
  private maxRetries = 2;

  constructor() {
    const env = getEnv();
    if (!env.GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY is required');
    }
    this.apiKey = env.GOOGLE_PLACES_API_KEY;
  }

  async searchPlaces(query: string, city?: string, country?: string): Promise<PlaceSearchResult[]> {
    logger.info('Searching places', { query, city, country });
    
    try {
      const searchQuery = [query, city, country].filter(Boolean).join(', ');
      const url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${this.apiKey}`;
      
      const response = await this.fetchWithRetry(url);
      const data: GooglePlacesResponse = await response.json();
      
      if (data.status !== 'OK') {
        throw new ProviderError(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, 'google-places', 502);
      }

      return data.results.slice(0, 3).map(this.mapGooglePlaceToResult);
    } catch (error) {
      logger.error('Places search failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
        city,
        country
      });
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<BusinessContext> {
    logger.info('Getting place details', { placeId });
    
    try {
      const fields = [
        'place_id',
        'name',
        'formatted_address',
        'website',
        'formatted_phone_number',
        'types',
        'rating',
        'user_ratings_total',
        'opening_hours',
        'reviews',
        'geometry'
      ].join(',');
      
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
      
      const response = await this.fetchWithRetry(url);
      const data: GooglePlacesResponse = await response.json();
      
      if (data.status !== 'OK') {
        throw new ProviderError(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, 'google-places', 502);
      }

      const place = data.results[0];
      if (!place) {
        throw new BadRequestError('Place not found');
      }
      
      return {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        website: place.website,
        phone: place.formatted_phone_number,
        types: place.types || [],
        rating: place.rating,
        hours: undefined,
        reviews_sample: [],
        geo: place.geometry?.location ? {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        } : undefined,
      };
    } catch (error) {
      logger.error('Get place details failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        placeId
      });
      throw error;
    }
  }

  private async fetchWithRetry(url: string, retryCount = 0): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          if (retryCount < this.maxRetries) {
            logger.warn('Retrying request', { 
              status: response.status, 
              retryCount: retryCount + 1,
              url: url.replace(this.apiKey, '[REDACTED]')
            });
            await this.delay(1000 * (retryCount + 1));
            return this.fetchWithRetry(url, retryCount + 1);
          }
        }
        throw new ProviderError(`HTTP ${response.status}: ${response.statusText}`, 'google-places', response.status);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderError('Request timeout', 'google-places', 408);
      }
      
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        logger.warn('Retrying request after error', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: retryCount + 1,
          url: url.replace(this.apiKey, '[REDACTED]')
        });
        await this.delay(1000 * (retryCount + 1));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('timeout') || 
             error.message.includes('network') ||
             error.message.includes('ECONNRESET') ||
             error.message.includes('ENOTFOUND');
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mapGooglePlaceToResult(place: GooglePlaceResult): PlaceSearchResult {
    return {
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      website: place.website,
      phone: place.formatted_phone_number,
      types: place.types || [],
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      geo: place.geometry?.location ? {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      } : undefined,
    };
  }
}
