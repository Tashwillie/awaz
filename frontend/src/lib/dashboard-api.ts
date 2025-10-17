import { Business, DemoSession, BusinessProfile, Call } from '@/types/demo'
import { CustomizeState, Faq } from '@/types/dashboard'

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

// Dashboard Analytics Types
export interface CallMetrics {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  averageCallDuration: number
  callSuccessRate: number
  todayCalls: number
  weeklyCalls: number
  monthlyCalls: number
}

export interface AgentPerformance {
  agentName: string
  status: 'active' | 'inactive' | 'training'
  lastCallTime?: string
  totalCallsHandled: number
  averageRating: number
  uptime: number
}

export interface DashboardData {
  business: Business
  agent: AgentPerformance
  metrics: CallMetrics
  recentCalls: Call[]
  sessionId?: string
}

// Dashboard API Functions
export async function getDashboardData(sessionId?: string): Promise<DashboardData> {
  const params = sessionId ? `?sessionId=${sessionId}` : ''
  const data = await apiRequest<DashboardData>(`/api/dashboard${params}`)
  return data
}

export async function getCallMetrics(sessionId?: string): Promise<CallMetrics> {
  const params = sessionId ? `?sessionId=${sessionId}` : ''
  const data = await apiRequest<CallMetrics>(`/api/dashboard/metrics${params}`)
  return data
}

export async function getRecentCalls(sessionId?: string, limit: number = 10): Promise<Call[]> {
  const params = new URLSearchParams()
  if (sessionId) params.append('sessionId', sessionId)
  params.append('limit', limit.toString())
  
  const data = await apiRequest<{ calls: Call[] }>(`/api/dashboard/calls?${params}`)
  return data.calls || []
}

export async function getAgentPerformance(sessionId?: string): Promise<AgentPerformance> {
  const params = sessionId ? `?sessionId=${sessionId}` : ''
  const data = await apiRequest<AgentPerformance>(`/api/dashboard/agent${params}`)
  return data
}

// Agent Configuration API
export async function updateAgentConfig(
  sessionId: string,
  config: Partial<CustomizeState>
): Promise<CustomizeState> {
  const data = await apiRequest<CustomizeState>('/api/dashboard/agent/config', {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      config,
    }),
  })
  return data
}

export async function getAgentConfig(sessionId: string): Promise<CustomizeState> {
  const data = await apiRequest<CustomizeState>(`/api/dashboard/agent/config?sessionId=${sessionId}`)
  return data
}

export async function updateFaqs(
  sessionId: string,
  faqs: Faq[]
): Promise<Faq[]> {
  const data = await apiRequest<{ faqs: Faq[] }>('/api/dashboard/agent/faqs', {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      faqs,
    }),
  })
  return data.faqs
}

export async function updateGreeting(
  sessionId: string,
  greeting: string,
  includeRecordingDisclaimer: boolean
): Promise<{ greeting: string; includeRecordingDisclaimer: boolean }> {
  const data = await apiRequest<{ greeting: string; includeRecordingDisclaimer: boolean }>('/api/dashboard/agent/greeting', {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      greeting,
      includeRecordingDisclaimer,
    }),
  })
  return data
}

export async function updateAgentSettings(
  sessionId: string,
  settings: {
    agentName?: string
    backgroundNoise?: string
  }
): Promise<{ agentName: string; backgroundNoise: string }> {
  const data = await apiRequest<{ agentName: string; backgroundNoise: string }>('/api/dashboard/agent/settings', {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      ...settings,
    }),
  })
  return data
}

// Call Management API
export async function startTestCall(sessionId: string, phoneNumber: string): Promise<Call> {
  const data = await apiRequest<Call>('/api/dashboard/calls/test', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      phoneNumber,
    }),
  })
  return data
}

export async function getCallDetails(callId: string): Promise<Call> {
  const data = await apiRequest<Call>(`/api/dashboard/calls/${callId}`)
  return data
}

export async function getCallTranscript(callId: string): Promise<{
  transcript: string
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  topics: string[]
}> {
  const data = await apiRequest<{
    transcript: string
    summary: string
    sentiment: 'positive' | 'neutral' | 'negative'
    topics: string[]
  }>(`/api/dashboard/calls/${callId}/transcript`)
  return data
}

// Agent Status API
export async function toggleAgentStatus(
  sessionId: string,
  status: 'active' | 'inactive'
): Promise<{ status: 'active' | 'inactive'; message: string }> {
  const data = await apiRequest<{ status: 'active' | 'inactive'; message: string }>('/api/dashboard/agent/status', {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      status,
    }),
  })
  return data
}

export async function retrainAgent(sessionId: string): Promise<{
  status: 'training' | 'completed' | 'failed'
  message: string
  progress?: number
}> {
  const data = await apiRequest<{
    status: 'training' | 'completed' | 'failed'
    message: string
    progress?: number
  }>('/api/dashboard/agent/retrain', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
    }),
  })
  return data
}

// Integration API
export async function getIntegrations(sessionId: string): Promise<{
  crm: 'hubspot' | 'pipedrive' | 'none'
  calendar: 'google' | 'calendly' | 'none'
  voice: 'retell' | 'vapi' | 'awaz'
  webhook: string | null
}> {
  const data = await apiRequest<{
    crm: 'hubspot' | 'pipedrive' | 'none'
    calendar: 'google' | 'calendly' | 'none'
    voice: 'retell' | 'vapi' | 'awaz'
    webhook: string | null
  }>(`/api/dashboard/integrations?sessionId=${sessionId}`)
  return data
}

export async function updateIntegration(
  sessionId: string,
  type: 'crm' | 'calendar' | 'voice' | 'webhook',
  config: any
): Promise<{ success: boolean; message: string }> {
  const data = await apiRequest<{ success: boolean; message: string }>('/api/dashboard/integrations', {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      type,
      config,
    }),
  })
  return data
}

// Phone Number Management
export async function getPhoneNumber(sessionId: string): Promise<{
  id: string
  number: string
  areaCode: string
  city: string
  state: string
  country: string
  status: 'active' | 'inactive' | 'pending'
  provider: string
}> {
  const data = await apiRequest(`/api/dashboard/agent/phone?sessionId=${sessionId}`)
  return data
}

export async function requestNewPhoneNumber(
  sessionId: string,
  areaCode?: string
): Promise<{
  id: string
  number: string
  areaCode: string
  city: string
  state: string
  country: string
  status: 'active' | 'inactive' | 'pending'
  provider: string
}> {
  const data = await apiRequest('/api/dashboard/agent/phone', {
    method: 'POST',
    body: JSON.stringify({ sessionId, areaCode }),
  })
  return data
}

// Test Call Management
export async function getTestCallConfig(sessionId: string): Promise<{
  id: string
  phoneNumber: string
  allowedNumbers: string[]
  status: 'active' | 'inactive'
  createdAt: string
}> {
  const data = await apiRequest(`/api/dashboard/agent/test-calls?sessionId=${sessionId}`)
  return data
}

export async function updateTestCallConfig(
  sessionId: string,
  allowedNumbers: string[],
  status: 'active' | 'inactive' = 'active'
): Promise<{
  id: string
  phoneNumber: string
  allowedNumbers: string[]
  status: 'active' | 'inactive'
  createdAt: string
}> {
  const data = await apiRequest('/api/dashboard/agent/test-calls', {
    method: 'PUT',
    body: JSON.stringify({ sessionId, allowedNumbers, status }),
  })
  return data
}

// Billing Management
export async function getBillingInfo(sessionId: string): Promise<{
  trialMinutes: number
  usedMinutes: number
  remainingMinutes: number
  trialEndDate: string
  hasPaymentMethod: boolean
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  plan: 'trial' | 'basic' | 'premium'
  pricePerMinute: number
}> {
  const data = await apiRequest(`/api/dashboard/billing?sessionId=${sessionId}`)
  return data
}

export async function startFreeTrial(sessionId: string): Promise<{
  success: boolean
  message: string
  billing: any
}> {
  const data = await apiRequest('/api/dashboard/billing', {
    method: 'POST',
    body: JSON.stringify({ sessionId, action: 'start_trial' }),
  })
  return data
}

export async function addPaymentMethod(sessionId: string): Promise<{
  success: boolean
  message: string
  billing: any
}> {
  const data = await apiRequest('/api/dashboard/billing', {
    method: 'POST',
    body: JSON.stringify({ sessionId, action: 'add_payment_method' }),
  })
  return data
}

// Call Forwarding
export async function getCallForwardingConfig(sessionId: string): Promise<{
  id: string
  phoneSystemType: 'mobile' | 'voip' | 'pstn' | 'landline'
  provider: string
  userPhoneNumber: string
  funnderPhoneNumber: string
  status: 'active' | 'inactive' | 'pending'
  setupInstructions: string[]
  createdAt: string
}> {
  const data = await apiRequest(`/api/dashboard/agent/call-forwarding?sessionId=${sessionId}`)
  return data
}

export async function configureCallForwarding(
  sessionId: string,
  phoneSystemType: 'mobile' | 'voip' | 'pstn' | 'landline',
  provider: string,
  userPhoneNumber: string,
  funnderPhoneNumber: string
): Promise<{
  success: boolean
  message: string
  config: any
}> {
  const data = await apiRequest('/api/dashboard/agent/call-forwarding', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      phoneSystemType,
      provider,
      userPhoneNumber,
      funnderPhoneNumber,
    }),
  })
  return data
}

export async function updateCallForwardingStatus(
  sessionId: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<{
  success: boolean
  message: string
  config: any
}> {
  const data = await apiRequest('/api/dashboard/agent/call-forwarding', {
    method: 'PUT',
    body: JSON.stringify({ sessionId, status }),
  })
  return data
}

// Real-time Updates
export async function subscribeToUpdates(
  sessionId: string,
  onUpdate: (data: any) => void
): Promise<() => void> {
  // In a real implementation, this would use WebSockets or Server-Sent Events
  // For now, we'll simulate with polling
  const interval = setInterval(async () => {
    try {
      const data = await getDashboardData(sessionId)
      onUpdate(data)
    } catch (error) {
      console.error('Failed to fetch updates:', error)
    }
  }, 5000)

  return () => clearInterval(interval)
}

export { ApiError }
