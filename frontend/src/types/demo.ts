export interface DemoFormData {
  businessName: string
  googleMapsUrl?: string
  visitorName?: string
  visitorEmail?: string
  visitorPhone: string
  consent: boolean
  useFirecrawl?: boolean
}

export interface Business {
  place_id: string
  name: string
  address: string
  website?: string
  phone?: string
  types: string[]
  rating?: number
  user_ratings_total?: number
  geo?: {
    lat: number
    lng: number
  }
}

export interface DemoSession {
  id: string
  status: 'DRAFT' | 'READY' | 'CALLING' | 'COMPLETED' | 'EXPIRED' | 'FAILED'
  provider: string
  createdAt: string
  ttlExpiresAt: string
}

export interface BusinessProfile {
  business_profile: {
    brand_voice: string
    services: string[]
    coverage_area?: string
    hours?: Record<string, string>
    pricing_notes?: string[]
    booking_rules?: string[]
    faqs?: string[]
    qualifying_questions?: string[]
    prohibited_claims?: string[]
  }
}

export interface Call {
  id: string
  status: 'INITIATED' | 'RINGING' | 'CONNECTED' | 'FAILED' | 'COMPLETED'
  provider: string
  providerCallId: string
  startedAt?: string
  connectedAt?: string
  endedAt?: string
  durationSec?: number
  summary?: string
  transcriptUrl?: string
}
