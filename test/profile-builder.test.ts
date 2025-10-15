import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileBuilderService } from '../src/services/profile-builder.service';
import { BusinessProfileSchema } from '../src/types/profile';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ProfileBuilderService', () => {
  let profileBuilderService: ProfileBuilderService;

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

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('deterministic profile building', () => {
    it('should generate a deterministic profile without OpenAI key', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);

      expect(profile).toEqual({
        brand_voice: expect.stringContaining('Acme Plumbing'),
        services: expect.arrayContaining(['Emergency plumbing', 'Pipe repair', 'Drain cleaning']),
        coverage_area: expect.stringContaining('Springfield'),
        hours: undefined,
        pricing_notes: expect.any(Array),
        booking_rules: expect.any(Array),
        faqs: expect.any(Array),
        qualifying_questions: expect.any(Array),
        prohibited_claims: expect.any(Array)
      });

      expect(BusinessProfileSchema.safeParse({ business_profile: profile }).success).toBe(true);
    });

    it('should include custom FAQs in deterministic profile', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const customFaqs = ['What is your emergency rate?', 'Do you offer warranties?'];
      const profile = await profileBuilderService.buildProfile(mockBusinessContext, { faqs: customFaqs });

      expect(profile.faqs).toEqual(expect.arrayContaining(customFaqs));
      expect(profile.faqs?.length).toBeLessThanOrEqual(8);
    });

    it('should generate appropriate services for different business types', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const restaurantContext = { ...mockBusinessContext, types: ['restaurant', 'food'] };
      const profile = await profileBuilderService.buildProfile(restaurantContext);

      expect(profile.services).toEqual(expect.arrayContaining(['Dine-in service', 'Takeout orders']));
    });

    it('should handle business with no rating', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const contextWithoutRating = { ...mockBusinessContext, rating: undefined };
      const profile = await profileBuilderService.buildProfile(contextWithoutRating);

      expect(profile.brand_voice).toContain('Building trust through quality service');
      expect(profile.services).toBeDefined();
    });
  });

  describe('LLM profile building', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
    });

    it('should generate profile with OpenAI when available', async () => {
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              business_profile: {
                brand_voice: 'Professional plumbing services for all your needs',
                services: ['Emergency plumbing', 'Pipe repair', 'Drain cleaning'],
                coverage_area: 'Springfield, IL',
                hours: { monday: '8am-5pm', tuesday: '8am-5pm' },
                pricing_notes: ['Competitive rates', 'Free estimates'],
                booking_rules: ['24-hour cancellation policy'],
                faqs: ['What are your hours?'],
                qualifying_questions: ['What service do you need?'],
                prohibited_claims: ['Cannot guarantee results']
              }
            })
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      });

      profileBuilderService = new ProfileBuilderService();
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);

      expect(profile.brand_voice).toBe('Professional plumbing services for all your needs');
      expect(profile.services).toEqual(['Emergency plumbing', 'Pipe repair', 'Drain cleaning']);
      expect(BusinessProfileSchema.safeParse({ business_profile: profile }).success).toBe(true);
    });

    it('should fallback to deterministic profile when OpenAI fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      profileBuilderService = new ProfileBuilderService();
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);

      expect(profile.brand_voice).toContain('Acme Plumbing');
      expect(profile.services).toEqual(expect.arrayContaining(['Emergency plumbing']));
    });

    it('should fallback to deterministic profile when OpenAI returns invalid JSON', async () => {
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: 'This is not valid JSON'
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      });

      profileBuilderService = new ProfileBuilderService();
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);

      expect(profile.brand_voice).toContain('Acme Plumbing');
    });

    it('should fallback to deterministic profile when OpenAI response fails schema validation', async () => {
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              business_profile: {
                brand_voice: 'Invalid profile',
                // Missing required services field
              }
            })
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      });

      profileBuilderService = new ProfileBuilderService();
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);

      expect(profile.brand_voice).toContain('Acme Plumbing');
    });

    it('should include website excerpt in OpenAI prompt', async () => {
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              business_profile: {
                brand_voice: 'Professional services',
                services: ['General services']
              }
            })
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      });

      profileBuilderService = new ProfileBuilderService();
      await profileBuilderService.buildProfile(mockBusinessContext, { 
        websiteExcerpt: 'We offer 24/7 emergency plumbing services' 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('We offer 24/7 emergency plumbing services')
        })
      );
    });
  });

  describe('schema validation', () => {
    it('should always return valid BusinessProfileJson', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);
      const validation = BusinessProfileSchema.safeParse({ business_profile: profile });
      
      expect(validation.success).toBe(true);
      if (!validation.success) {
        console.error('Validation errors:', validation.error.errors);
      }
    });

    it('should handle unknown business types gracefully', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const unknownBusinessContext = { 
        ...mockBusinessContext, 
        types: ['unknown_business_type'] 
      };
      
      const profile = await profileBuilderService.buildProfile(unknownBusinessContext);
      
      expect(profile.services).toEqual(['General services', 'Professional consultation']);
      expect(BusinessProfileSchema.safeParse({ business_profile: profile }).success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty business context gracefully', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const emptyContext = {
        place_id: 'test',
        name: '',
        address: '',
        types: [],
        rating: undefined,
        hours: undefined,
        reviews_sample: [],
        geo: undefined
      };
      
      expect(async () => {
        await profileBuilderService.buildProfile(emptyContext);
      }).not.toThrow();
    });

    it('should handle missing options gracefully', async () => {
      process.env.OPENAI_API_KEY = undefined;
      profileBuilderService = new ProfileBuilderService();
      
      const profile = await profileBuilderService.buildProfile(mockBusinessContext);
      
      expect(profile).toBeDefined();
      expect(profile.faqs).toBeDefined();
      expect(profile.services).toBeDefined();
    });
  });
});
