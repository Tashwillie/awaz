import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// Lazily load PrismaClient at runtime to avoid touching it during build
let prismaSingleton: any | null = null;
async function getPrisma() {
  if (!prismaSingleton) {
    const { PrismaClient } = await import('@prisma/client');
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton as import('@prisma/client').PrismaClient;
}
import { PlacesService } from '@/services/places.service';
import { ProfileBuilderService } from '@/services/profile-builder.service';
import { logger } from '@/lib/logger';
import { BadRequestError } from '@/lib/errors';

// Access via getPrisma() inside handlers

const confirmSchema = z.object({
  sessionId: z.string(),
  placeId: z.string(),
  websiteExcerpt: z.string().optional(),
  edits: z.record(z.any()).optional(),
  faqs: z.array(z.string()).optional(),
  useFirecrawl: z.boolean().default(true),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneE164: z.string(),
  consent: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  let validatedBody: any = null;
  
  try {
    const body = await request.json();
    validatedBody = confirmSchema.parse(body);
    
    requestLogger.info('Demo confirm requested', { 
      sessionId: validatedBody.sessionId,
      placeId: validatedBody.placeId,
      hasWebsiteExcerpt: !!validatedBody.websiteExcerpt,
      hasEdits: !!validatedBody.edits,
      faqCount: validatedBody.faqs?.length || 0
    });
    
    const placesService = new PlacesService();
    const profileBuilderService = new ProfileBuilderService();
    
    const businessContext = await placesService.getPlaceDetails(validatedBody.placeId);
    
    const profileOptions = {
      websiteExcerpt: validatedBody.websiteExcerpt,
      edits: validatedBody.edits,
      faqs: validatedBody.faqs,
      useFirecrawl: validatedBody.useFirecrawl,
    };
    
    const businessProfile = await profileBuilderService.buildProfile(businessContext, profileOptions);
    
    await prisma.$transaction(async (tx) => {
      await tx.businessContext.create({
        data: {
          demoSessionId: validatedBody.sessionId,
          placeId: businessContext.place_id,
          name: businessContext.name,
          address: businessContext.address,
          website: businessContext.website,
          phone: businessContext.phone,
          types: businessContext.types,
          rating: businessContext.rating,
          hoursJson: businessContext.hours,
          reviewsSample: businessContext.reviews_sample,
          geoLat: businessContext.geo?.lat,
          geoLng: businessContext.geo?.lng,
        },
      });
      
      await tx.businessProfile.create({
        data: {
          demoSessionId: validatedBody.sessionId,
          json: businessProfile,
        },
      });
      
      await tx.lead.create({
        data: {
          demoSessionId: validatedBody.sessionId,
          name: validatedBody.name,
          email: validatedBody.email,
          phoneE164: validatedBody.phoneE164,
          consent: validatedBody.consent,
        },
      });
      
      await tx.demoSession.update({
        where: { id: validatedBody.sessionId },
        data: { status: 'READY' },
      });
    });
    
    requestLogger.info('Demo confirm completed', {
      sessionId: validatedBody.sessionId,
      businessName: businessContext.name,
      servicesCount: businessProfile.services?.length || 0
    });
    
    return NextResponse.json({
      business_profile_json: businessProfile,
      requestId,
    });
  } catch (error) {
    const { searchParams } = new URL(request.url);
    requestLogger.error('Demo confirm failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: validatedBody?.sessionId || 'unknown'
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
    
    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  }
}


