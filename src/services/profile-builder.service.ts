import { BusinessContext, BusinessProfileJson } from '@/types/profile';
import { logger } from '@/lib/logger';
import { getEnv } from '@/lib/env';
import { BusinessProfileSchema } from '@/types/profile';
import { FirecrawlService, FirecrawlWebsiteData } from './firecrawl.service';

interface ProfileBuildOptions {
  websiteExcerpt?: string;
  edits?: Record<string, any>;
  faqs?: string[];
  useFirecrawl?: boolean;
}

export class ProfileBuilderService {
  private openaiApiKey?: string;
  private firecrawlService?: FirecrawlService;

  constructor() {
    const env = getEnv();
    this.openaiApiKey = env.OPENAI_API_KEY;
    
    // Initialize Firecrawl service if API key is available
    if (env.FIRECRAWL_API_KEY) {
      try {
        this.firecrawlService = new FirecrawlService();
      } catch (error) {
        logger.warn('Firecrawl service not available', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
  }

  async buildProfile(context: BusinessContext, options: ProfileBuildOptions = {}): Promise<BusinessProfileJson> {
    logger.info('Building business profile', { 
      placeId: context.place_id,
      hasOpenAI: !!this.openaiApiKey,
      hasFirecrawl: !!this.firecrawlService,
      hasWebsiteExcerpt: !!options.websiteExcerpt,
      useFirecrawl: options.useFirecrawl
    });

    // Enhance context with Firecrawl data if available and requested
    let enhancedContext = context;
    if (this.firecrawlService && context.website && options.useFirecrawl !== false) {
      try {
        const firecrawlData = await this.firecrawlService.extractBusinessInfo(context.website);
        enhancedContext = this.mergeFirecrawlData(context, firecrawlData);
        logger.info('Enhanced context with Firecrawl data', { 
          servicesFound: firecrawlData.services?.length || 0,
          pricingFound: firecrawlData.pricing?.length || 0,
          testimonialsFound: firecrawlData.testimonials?.length || 0
        });
      } catch (error) {
        logger.warn('Failed to enhance context with Firecrawl data', {
          error: error instanceof Error ? error.message : 'Unknown error',
          website: context.website
        });
      }
    }

    if (this.openaiApiKey) {
      try {
        return await this.buildProfileWithLLM(enhancedContext, options);
      } catch (error) {
        logger.warn('LLM profile building failed, falling back to deterministic', {
          error: error instanceof Error ? error.message : 'Unknown error',
          placeId: context.place_id
        });
        return this.buildDeterministicProfile(enhancedContext, options);
      }
    } else {
      logger.info('Using deterministic profile builder (no OpenAI key)');
      return this.buildDeterministicProfile(enhancedContext, options);
    }
  }

  private async buildProfileWithLLM(context: BusinessContext, options: ProfileBuildOptions): Promise<BusinessProfileJson> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not available');
    }

    const systemPrompt = `You are a business profile generator. Generate ONLY valid JSON that matches this exact schema:

{
  "business_profile": {
    "brand_voice": "string",
    "services": ["string", "string"],
    "coverage_area": "string (optional)",
    "hours": {"day": "hours", "day": "hours"} (optional),
    "pricing_notes": ["string", "string"] (optional),
    "booking_rules": ["string", "string"] (optional),
    "faqs": ["string", "string"] (optional),
    "qualifying_questions": ["string", "string"] (optional),
    "prohibited_claims": ["string", "string"] (optional)
  }
}

Generate a professional business profile for this business:
- Name: ${context.name}
- Address: ${context.address}
- Types: ${context.types.join(', ')}
- Rating: ${context.rating || 'N/A'}
- Website: ${context.website || 'Not provided'}
- Phone: ${context.phone || 'Not provided'}
${options.websiteExcerpt ? `- Website excerpt: ${options.websiteExcerpt}` : ''}

Make the profile realistic and professional. Use the business type to suggest appropriate services.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the business profile JSON only.' }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      const validated = BusinessProfileSchema.parse(parsed);
      return validated.business_profile;
    } catch (error) {
      logger.error('Failed to parse/validate OpenAI response', {
        content: content.substring(0, 200),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private mergeFirecrawlData(context: BusinessContext, firecrawlData: Partial<FirecrawlWebsiteData>): BusinessContext {
    return {
      ...context,
      // Enhance existing data with Firecrawl insights
      website: firecrawlData.url || context.website,
      // Add extracted services to types if available
      types: firecrawlData.services ? 
        [...new Set([...context.types, ...firecrawlData.services])] : 
        context.types,
      // Use Firecrawl contact info if available
      phone: firecrawlData.contactInfo?.phone || context.phone,
      // Store additional Firecrawl data in a custom field for deterministic builder
      ...(firecrawlData.services && { extractedServices: firecrawlData.services }),
      ...(firecrawlData.pricing && { extractedPricing: firecrawlData.pricing }),
      ...(firecrawlData.testimonials && { extractedTestimonials: firecrawlData.testimonials }),
      ...(firecrawlData.businessHours && { extractedHours: firecrawlData.businessHours }),
      ...(firecrawlData.policies && { extractedPolicies: firecrawlData.policies }),
    } as BusinessContext & {
      extractedServices?: string[];
      extractedPricing?: string[];
      extractedTestimonials?: string[];
      extractedHours?: Record<string, string>;
      extractedPolicies?: string[];
    };
  }

  private buildDeterministicProfile(context: BusinessContext, options: ProfileBuildOptions): BusinessProfileJson {
    const businessType = context.types[0] || 'business';
    const rating = context.rating || 0;
    
    // Cast context to include Firecrawl data
    const enhancedContext = context as BusinessContext & {
      extractedServices?: string[];
      extractedPricing?: string[];
      extractedTestimonials?: string[];
      extractedHours?: Record<string, string>;
      extractedPolicies?: string[];
    };
    
    return {
      brand_voice: this.generateBrandVoice(businessType, rating, context.name),
      services: this.generateServices(businessType, enhancedContext.extractedServices),
      coverage_area: this.extractCoverageArea(context.address),
      hours: enhancedContext.extractedHours || undefined,
      pricing_notes: this.generatePricingNotes(businessType, enhancedContext.extractedPricing),
      booking_rules: this.generateBookingRules(businessType, enhancedContext.extractedPolicies),
      faqs: this.generateFAQs(businessType, options.faqs, enhancedContext.extractedTestimonials),
      qualifying_questions: this.generateQualifyingQuestions(businessType),
      prohibited_claims: this.generateProhibitedClaims(businessType),
    };
  }

  private generateBrandVoice(businessType: string, rating: number, businessName: string): string {
    const voiceTemplates: Record<string, string> = {
      'plumber': 'Professional plumbing services with quick response times and quality workmanship.',
      'electrician': 'Expert electrical services with safety and reliability as our top priorities.',
      'hvac': 'Comfort specialists providing efficient heating and cooling solutions for your home.',
      'restaurant': 'Delicious food and exceptional service in a welcoming atmosphere.',
      'beauty_salon': 'Professional beauty services to help you look and feel your best.',
      'car_repair': 'Trusted auto repair with honest service and quality workmanship.',
      'dentist': 'Compassionate dental care focused on your oral health and comfort.',
      'lawyer': 'Experienced legal representation with your best interests in mind.',
      'accountant': 'Professional accounting services with accuracy and attention to detail.',
      'real_estate': 'Expert real estate services helping you find your perfect property.',
    };

    const baseTemplate = voiceTemplates[businessType] || 
      `Professional ${businessType} services delivered with care and expertise.`;

    const ratingPhrase = getRatingPhrase(rating);
    return `${businessName}: ${baseTemplate} ${ratingPhrase}`;
  }

  private generateServices(businessType: string, extractedServices?: string[]): string[] {
    // Use extracted services if available, otherwise fall back to defaults
    if (extractedServices && extractedServices.length > 0) {
      return extractedServices.slice(0, 8); // Limit to 8 services
    }

    const serviceMap: Record<string, string[]> = {
      'plumber': ['Emergency plumbing', 'Pipe repair', 'Drain cleaning', 'Water heater service', 'Fixture installation'],
      'electrician': ['Electrical repairs', 'Outlet installation', 'Lighting upgrades', 'Panel upgrades', 'Wiring installation'],
      'hvac': ['Heating repair', 'Air conditioning', 'Duct cleaning', 'Thermostat installation', 'Preventive maintenance'],
      'restaurant': ['Dine-in service', 'Takeout orders', 'Catering services', 'Private events', 'Delivery service'],
      'beauty_salon': ['Hair styling', 'Hair coloring', 'Manicures', 'Pedicures', 'facial treatments', 'Massage therapy'],
      'car_repair': ['Oil changes', 'Brake service', 'Engine repair', 'Tire replacement', 'Diagnostic services'],
      'dentist': ['General dentistry', 'Teeth cleaning', 'Fillings', 'Crowns', 'Preventive care'],
      'lawyer': ['Legal consultation', 'Document review', 'Court representation', 'Contract drafting', 'Legal advice'],
      'accountant': ['Tax preparation', 'Bookkeeping', 'Financial planning', 'Audit services', 'Payroll processing'],
      'real_estate': ['Property sales', 'Rental services', 'Property management', 'Home inspections', 'Market analysis'],
    };

    return serviceMap[businessType] || ['General services', 'Professional consultation'];
  }

  private extractCoverageArea(address: string): string {
    const parts = address.split(',');
    if (parts.length >= 2) {
      return `${parts[1]}, ${parts[2] || ''}`.trim();
    }
    return 'Local area';
  }

  private generatePricingNotes(businessType: string, extractedPricing?: string[]): string[] {
    const notes = [
      'Competitive pricing based on industry standards',
      'Free estimates available for most services',
      'Senior and military discounts offered',
      'Emergency service rates may apply for urgent needs'
    ];

    // Add extracted pricing if available
    if (extractedPricing && extractedPricing.length > 0) {
      notes.unshift(...extractedPricing.slice(0, 3));
    }

    if (['plumber', 'electrician', 'hvac'].includes(businessType)) {
      notes.push('Overtime rates for after-hours service');
      notes.push('Material costs separate from labor');
    }

    return notes.slice(0, 8); // Limit to 8 notes
  }

  private generateBookingRules(businessType: string, extractedPolicies?: string[]): string[] {
    const rules = [
      '24-hour cancellation policy',
      'Payment due upon completion of service',
      'Same-day appointments subject to availability'
    ];

    // Add extracted policies if available
    if (extractedPolicies && extractedPolicies.length > 0) {
      rules.unshift(...extractedPolicies.slice(0, 3));
    }

    if (['restaurant'].includes(businessType)) {
      rules.push('Reservations recommended for weekend dining');
      rules.push('Large party reservations require advance notice');
    } else {
      rules.push('Emergency services available 24/7');
    }

    return rules.slice(0, 8); // Limit to 8 rules
  }

  private generateFAQs(businessType: string, customFaqs?: string[], extractedTestimonials?: string[]): string[] {
    const defaultFaqs = [
      'What are your service hours?',
      'Do you offer emergency services?',
      'What payment methods do you accept?',
      'Do you provide free estimates?',
      'Are you licensed and insured?'
    ];

    const businessSpecificFaqs: Record<string, string[]> = {
      'plumber': ['What should I do in a plumbing emergency?', 'Do you offer warranty on repairs?'],
      'electrician': ['Do you work on both residential and commercial?', 'Are your electricians licensed?'],
      'restaurant': ['Do you accommodate dietary restrictions?', 'Is parking available?'],
      'beauty_salon': ['Do you require appointments?', 'What products do you use?'],
      'car_repair': ['Do you offer warranty on repairs?', 'Can I get a rental car?'],
    };

    const specificFaqs = businessSpecificFaqs[businessType] || [];
    let allFaqs = [...defaultFaqs, ...specificFaqs];

    // Add testimonials as FAQ answers if available
    if (extractedTestimonials && extractedTestimonials.length > 0) {
      const testimonialFaqs = extractedTestimonials.slice(0, 2).map(testimonial => 
        `Customer feedback: "${testimonial.substring(0, 100)}${testimonial.length > 100 ? '...' : ''}"`
      );
      allFaqs = [...testimonialFaqs, ...allFaqs];
    }

    if (customFaqs && customFaqs.length > 0) {
      return [...customFaqs, ...allFaqs.slice(0, 5)].slice(0, 8);
    }

    return allFaqs.slice(0, 8);
  }

  private generateQualifyingQuestions(businessType: string): string[] {
    return [
      'What type of service do you need?',
      'When would you like to schedule?',
      'Is this an emergency situation?',
      `Have you used ${businessType} services before?`,
      'Do you have any specific requirements or preferences?'
    ];
  }

  private generateProhibitedClaims(businessType: string): string[] {
    return [
      'Cannot guarantee specific outcomes or results',
      'Services subject to availability and professional assessment',
      'Emergency services may have additional charges',
      'Results may vary based on individual circumstances'
    ];
  }
}

function getRatingPhrase(rating: number): string {
  if (rating >= 4.5) return 'Highly rated with excellent customer satisfaction.';
  if (rating >= 4.0) return 'Well-reviewed with good customer feedback.';
  if (rating >= 3.0) return 'Experienced provider with growing reputation.';
  return 'Building trust through quality service.';
}


