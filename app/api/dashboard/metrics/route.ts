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

function generateMockMetrics(): CallMetrics {
  const totalCalls = Math.floor(Math.random() * 500) + 100
  const answeredCalls = Math.floor(totalCalls * (0.7 + Math.random() * 0.2)) // 70-90% answer rate
  
  return {
    totalCalls,
    answeredCalls,
    missedCalls: totalCalls - answeredCalls,
    averageCallDuration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
    callSuccessRate: Math.floor(Math.random() * 30) + 70, // 70-99%
    todayCalls: Math.floor(Math.random() * 20) + 5,
    weeklyCalls: Math.floor(Math.random() * 100) + 30,
    monthlyCalls: Math.floor(Math.random() * 300) + 150,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    // In production, this would query your database for real metrics
    // For now, we'll return mock data
    const metrics = generateMockMetrics()

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call metrics' },
      { status: 500 }
    )
  }
}
