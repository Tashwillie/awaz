import { Business, DemoSession, BusinessProfile, Call } from '@/types/demo'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`
    let errorDetails

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
      errorDetails = errorData.details
    } catch {
      // Ignore JSON parse errors
    }

    throw new ApiError(errorMessage, response.status, errorDetails)
  }

  return response.json()
}

// Places API
export async function searchPlaces(
  query: string,
  city?: string,
  country?: string
): Promise<Business[]> {
  const params = new URLSearchParams({
    q: query,
    ...(city && { city }),
    ...(country && { country }),
  })

  // Backend returns shape: { results: Business[], requestId: string }
  const data = await apiRequest<{ results: Business[]; requestId?: string }>(
    `/api/places/search?${params}`
  )
  return data.results || []
}

// Demo API
export async function createDemoSession(provider: string = 'retell'): Promise<DemoSession> {
  const data = await apiRequest<DemoSession>('/api/demo/start', {
    method: 'POST',
    body: JSON.stringify({ provider }),
  })
  return data
}

export async function confirmDemo(
  sessionId: string,
  placeId: string,
  visitorInfo: {
    name?: string
    email?: string
    phoneE164: string
    consent: boolean
  },
  options: {
    useFirecrawl?: boolean
    websiteExcerpt?: string
    edits?: Record<string, any>
    faqs?: string[]
  } = {}
): Promise<BusinessProfile> {
  const data = await apiRequest<BusinessProfile>('/api/demo/confirm', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      placeId,
      ...visitorInfo,
      ...options,
    }),
  })
  return data
}

export async function startVoiceCall(
  sessionId: string,
  phoneE164: string,
  turnstileToken?: string
): Promise<Call> {
  const headers: Record<string, string> = {}
  if (turnstileToken) {
    headers['X-Turnstile-Token'] = turnstileToken
  }

  const data = await apiRequest<Call>('/api/demo/receive-call', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId,
      phone_e164: phoneE164,
    }),
  })
  return data
}

export async function getDemoStatus(sessionId: string): Promise<{
  status: string
  callStatus?: string
  businessProfile?: BusinessProfile
  call?: Call
}> {
  const data = await apiRequest(`/api/demo/status/${sessionId}`)        
  return data as {
    status: string
    callStatus?: string
    businessProfile?: BusinessProfile
    call?: Call
  }
}

// Health check
export async function healthCheck(): Promise<{
  ok: boolean
  version: string
  timestamp: string
  requestId: string
}> {
  const data = await apiRequest('/api/health')
  return data as {
    ok: boolean
    version: string
    timestamp: string
    requestId: string
  }
}
