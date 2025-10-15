import { z } from 'zod';

export const BusinessContextSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  types: z.array(z.string()),
  rating: z.number().optional(),
  hours: z.record(z.string()).optional(),
  reviews_sample: z.array(z.string()).optional(),
  geo: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const BusinessProfileSchema = z.object({
  business_profile: z.object({
    brand_voice: z.string(),
    services: z.array(z.string()),
    coverage_area: z.string().optional(),
    hours: z.record(z.string()).optional(),
    pricing_notes: z.array(z.string()).optional(),
    booking_rules: z.array(z.string()).optional(),
    faqs: z.array(z.string()).optional(),
    qualifying_questions: z.array(z.string()).optional(),
    prohibited_claims: z.array(z.string()).optional(),
  }),
});

export const VoiceStartSchema = z.object({
  phone_e164: z.string(),
  profile: BusinessProfileSchema,
});

export type BusinessContext = z.infer<typeof BusinessContextSchema>;
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
export type BusinessProfileJson = BusinessProfile['business_profile'];
export type VoiceStart = z.infer<typeof VoiceStartSchema>;







