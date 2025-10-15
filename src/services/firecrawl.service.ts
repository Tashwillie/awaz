import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { ProviderError } from '@/lib/errors';

export interface FirecrawlWebsiteData {
  url: string;
  title?: string;
  description?: string;
  content?: string;
  services?: string[];
  pricing?: string[];
  testimonials?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  businessHours?: Record<string, string>;
  policies?: string[];
}

export class FirecrawlService {
  private apiKey: string;
  private baseUrl = 'https://api.firecrawl.dev/v1';

  constructor() {
    const env = getEnv();
    if (!env.FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is required');
    }
    this.apiKey = env.FIRECRAWL_API_KEY;
  }

  async scrapeWebsite(url: string): Promise<FirecrawlWebsiteData> {
    logger.info('Scraping website with Firecrawl', { url });

    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          includeTags: ['h1', 'h2', 'h3', 'p', 'div', 'span', 'a'],
          excludeTags: ['script', 'style', 'nav', 'footer', 'header'],
          waitFor: 2000, // Wait 2 seconds for dynamic content
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `Firecrawl API error: ${response.status} ${response.statusText} - ${errorText}`,
          'firecrawl',
          response.status
        );
      }

      const data = await response.json();
      return this.parseFirecrawlResponse(data, url);
    } catch (error) {
      logger.error('Firecrawl scraping failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
      });
      throw error;
    }
  }

  async extractBusinessInfo(url: string): Promise<Partial<FirecrawlWebsiteData>> {
    logger.info('Extracting business information', { url });

    try {
      const scrapedData = await this.scrapeWebsite(url);
      return this.extractStructuredData(scrapedData);
    } catch (error) {
      logger.warn('Failed to extract business info, returning basic data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
      });
      
      // Return minimal data if scraping fails
      return {
        url,
        title: 'Business Website',
        description: 'Website content could not be extracted',
      };
    }
  }

  private parseFirecrawlResponse(data: any, url: string): FirecrawlWebsiteData {
    const result: FirecrawlWebsiteData = {
      url,
      title: data.metadata?.title || data.title,
      description: data.metadata?.description || data.description,
      content: data.markdown || data.content,
    };

    // Extract additional structured data if available
    if (data.llm_extraction) {
      const extracted = data.llm_extraction;
      result.services = extracted.services || [];
      result.pricing = extracted.pricing || [];
      result.testimonials = extracted.testimonials || [];
      result.contactInfo = extracted.contactInfo || {};
      result.businessHours = extracted.businessHours || {};
      result.policies = extracted.policies || [];
    }

    return result;
  }

  private extractStructuredData(data: FirecrawlWebsiteData): Partial<FirecrawlWebsiteData> {
    const content = data.content || '';
    const title = data.title || '';

    return {
      url: data.url,
      title: data.title,
      description: data.description,
      services: this.extractServices(content, title),
      pricing: this.extractPricing(content),
      testimonials: this.extractTestimonials(content),
      contactInfo: this.extractContactInfo(content),
      businessHours: this.extractBusinessHours(content),
      policies: this.extractPolicies(content),
    };
  }

  private extractServices(content: string, title: string): string[] {
    const services: string[] = [];
    const serviceKeywords = [
      'service', 'services', 'offering', 'offerings', 'specialty', 'specialties',
      'what we do', 'our services', 'service list', 'available services'
    ];

    // Look for service sections
    const lines = content.split('\n');
    let inServiceSection = false;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check if we're entering a service section
      if (serviceKeywords.some(keyword => lowerLine.includes(keyword))) {
        inServiceSection = true;
        continue;
      }

      // If we're in a service section, look for bullet points or list items
      if (inServiceSection) {
        if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
          const service = line.replace(/^[-•*\d.]\s*/, '').trim();
          if (service.length > 3 && service.length < 100) {
            services.push(service);
          }
        }
      }

      // Stop if we hit another major section
      if (inServiceSection && (lowerLine.includes('contact') || lowerLine.includes('about') || lowerLine.includes('pricing'))) {
        inServiceSection = false;
      }
    }

    // Also look for services in any line that starts with a bullet point
    if (services.length === 0) {
      for (const line of lines) {
        if (line.match(/^[-•*]\s/)) {
          const service = line.replace(/^[-•*]\s*/, '').trim();
          if (service.length > 3 && service.length < 100 && !service.toLowerCase().includes('contact') && !service.toLowerCase().includes('pricing')) {
            services.push(service);
          }
        }
      }
    }

    // Fallback: extract from title if no services found
    if (services.length === 0 && title) {
      const businessType = this.inferBusinessType(title);
      if (businessType) {
        services.push(businessType);
      }
    }

    return services.slice(0, 10); // Limit to 10 services
  }

  private extractPricing(content: string): string[] {
    const pricing: string[] = [];
    const pricingKeywords = ['price', 'pricing', 'cost', 'rate', 'fee', '$', '€', '£'];

    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (pricingKeywords.some(keyword => lowerLine.includes(keyword))) {
        // Look for price patterns or lines that contain pricing info
        const priceMatch = line.match(/\$[\d,]+(?:\.\d{2})?/g);
        if (priceMatch || lowerLine.includes('hour') || lowerLine.includes('service')) {
          pricing.push(line.trim());
        }
      }
    }

    return pricing.slice(0, 5); // Limit to 5 pricing items
  }

  private extractTestimonials(content: string): string[] {
    const testimonials: string[] = [];
    const testimonialKeywords = ['testimonial', 'review', 'customer says', 'client says', 'feedback'];

    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (testimonialKeywords.some(keyword => lowerLine.includes(keyword))) {
        // Look for quoted text or review content
        const quotedMatch = line.match(/[""'']([^""'']+)[""'']/);
        if (quotedMatch) {
          testimonials.push(quotedMatch[1]);
        }
      }
      
      // Also look for lines that start with quotes
      if (line.match(/^[""'']/) && line.length > 10) {
        const quotedText = line.replace(/^[""'']/, '').replace(/[""'']$/, '').trim();
        if (quotedText.length > 10 && quotedText.length < 200) {
          testimonials.push(quotedText);
        }
      }
    }

    return testimonials.slice(0, 3); // Limit to 3 testimonials
  }

  private extractContactInfo(content: string): { phone?: string; email?: string; address?: string } {
    const contactInfo: { phone?: string; email?: string; address?: string } = {};

    // Extract phone numbers
    const phoneMatch = content.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0].trim();
    }

    // Extract email
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    // Extract address (simplified)
    const addressMatch = content.match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)/i);
    if (addressMatch) {
      contactInfo.address = addressMatch[0];
    }

    return contactInfo;
  }

  private extractBusinessHours(content: string): Record<string, string> {
    const hours: Record<string, string> = {};
    const dayPatterns = [
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
    ];

    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const day of dayPatterns) {
        if (lowerLine.includes(day)) {
          // Extract time pattern
          const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?\s*-\s*\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
          if (timeMatch) {
            hours[day] = timeMatch[1];
          }
        }
      }
    }

    return hours;
  }

  private extractPolicies(content: string): string[] {
    const policies: string[] = [];
    const policyKeywords = ['policy', 'policies', 'terms', 'conditions', 'cancellation', 'refund', 'warranty'];

    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (policyKeywords.some(keyword => lowerLine.includes(keyword))) {
        policies.push(line.trim());
      }
    }

    return policies.slice(0, 5); // Limit to 5 policies
  }

  private inferBusinessType(title: string): string | null {
    const businessTypes: Record<string, string> = {
      'plumb': 'Plumbing Services',
      'electric': 'Electrical Services',
      'hvac': 'HVAC Services',
      'restaurant': 'Restaurant Services',
      'salon': 'Beauty Services',
      'repair': 'Repair Services',
      'cleaning': 'Cleaning Services',
      'landscap': 'Landscaping Services',
      'legal': 'Legal Services',
      'account': 'Accounting Services',
    };

    const lowerTitle = title.toLowerCase();
    for (const [keyword, businessType] of Object.entries(businessTypes)) {
      if (lowerTitle.includes(keyword)) {
        return businessType;
      }
    }

    return null;
  }
}
