import { NextRequest, NextResponse } from 'next/server'

interface CallMetrics {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  averageCallDuration: number
  callSuccessRate: number
  todayCalls: number
  weeklyCalls: number
  monthlyCalls: number
}

interface AgentPerformance {
  agentName: string
  status: 'active' | 'inactive' | 'training'
  lastCallTime?: string
  totalCallsHandled: number
  averageRating: number
  uptime: number
}

interface DashboardData {
  business: {
    name: string
    address: string
    place_id: string
    website?: string
  }
  agent: AgentPerformance
  metrics: CallMetrics
  recentCalls: any[]
  sessionId?: string
}

// Mock data generator for development
function generateMockDashboardData(sessionId?: string): DashboardData {
  const business = {
    name: sessionId ? `Business ${sessionId.slice(-4)}` : 'Demo Business',
    address: '123 Main St, City, State 12345',
    place_id: sessionId || 'demo_place_id',
    website: 'https://example.com'
  }

  const metrics: CallMetrics = {
    totalCalls: Math.floor(Math.random() * 500) + 100,
    answeredCalls: Math.floor(Math.random() * 400) + 80,
    missedCalls: Math.floor(Math.random() * 50) + 10,
    averageCallDuration: Math.floor(Math.random() * 300) + 120, // seconds
    callSuccessRate: Math.floor(Math.random() * 30) + 70, // percentage
    todayCalls: Math.floor(Math.random() * 20) + 5,
    weeklyCalls: Math.floor(Math.random() * 100) + 30,
    monthlyCalls: Math.floor(Math.random() * 300) + 150,
  }

  const agent: AgentPerformance = {
    agentName: 'Funnder AI',
    status: 'active',
    lastCallTime: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24h
    totalCallsHandled: metrics.answeredCalls,
    averageRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
    uptime: Math.floor(Math.random() * 20) + 80, // 80-99%
  }

  // Generate recent calls
  const recentCalls = Array.from({ length: 5 }, (_, i) => ({
    id: `call_${Date.now()}_${i}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(), // Every hour
    duration: Math.floor(Math.random() * 300) + 60,
    status: ['completed', 'missed', 'in_progress'][Math.floor(Math.random() * 3)],
    phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    rating: Math.floor(Math.random() * 2) + 4,
    transcript: 'Sample call transcript...',
  }))

  return {
    business,
    agent,
    metrics,
    recentCalls,
    sessionId,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    // In production, this would fetch real data from your database
    // For now, we'll return mock data based on sessionId
    const dashboardData = generateMockDashboardData(sessionId || undefined)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
