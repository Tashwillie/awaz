import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PlacesService } from '@/services/places.service';
import { BadRequestError, ProviderError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const searchSchema = z.object({
  q: z.string().min(1, 'Query is required').max(100, 'Query too long'),
  city: z.string().max(50, 'City name too long').optional(),
  country: z.string().max(50, 'Country name too long').optional(),
});

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = searchSchema.parse(query);
    requestLogger.info('Places search requested', { 
      query: validatedQuery.q,
      city: validatedQuery.city,
      country: validatedQuery.country
    });
    
    const placesService = new PlacesService();
    const results = await placesService.searchPlaces(
      validatedQuery.q,
      validatedQuery.city,
      validatedQuery.country
    );
    
    requestLogger.info('Places search completed', { 
      resultCount: results.length,
      query: validatedQuery.q
    });
    
    return NextResponse.json({
      results,
      requestId,
    });
  } catch (error) {
    const { searchParams } = new URL(request.url);
    requestLogger.error('Places search failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      query: searchParams.get('q')
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          requestId 
        },
        { status: 400 }
      );
    }
    
    if (error instanceof BadRequestError) {
      return NextResponse.json(
        { error: error.message, requestId },
        { status: error.statusCode }
      );
    }
    
    if (error instanceof ProviderError) {
      return NextResponse.json(
        { 
          error: 'Places service temporarily unavailable', 
          requestId 
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  }
}
