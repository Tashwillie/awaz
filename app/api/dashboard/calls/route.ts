import { NextRequest, NextResponse } from 'next/server'

interface Call {
  id: string
  timestamp: string
  duration: number
  status: 'completed' | 'missed' | 'in_progress' | 'failed'
  phoneNumber: string
  rating?: number
  transcript?: string
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  topics?: string[]
}

function generateMockCalls(count: number = 10): Call[] {
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(Date.now() - i * 3600000).toISOString() // Every hour
    const statuses: Call['status'][] = ['completed', 'missed', 'in_progress', 'failed']
    const sentiments: Call['sentiment'][] = ['positive', 'neutral', 'negative']
    const topics = [
      ['appointment', 'booking'],
      ['pricing', 'cost'],
      ['hours', 'availability'],
      ['delivery', 'shipping'],
      ['support', 'help']
    ]

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const duration = status === 'completed' ? Math.floor(Math.random() * 300) + 60 : 0
    const rating = status === 'completed' ? Math.floor(Math.random() * 2) + 4 : undefined
    const sentiment = status === 'completed' ? sentiments[Math.floor(Math.random() * sentiments.length)] : undefined
    const callTopics = topics[Math.floor(Math.random() * topics.length)]

    return {
      id: `call_${Date.now()}_${i}`,
      timestamp,
      duration,
      status,
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      rating,
      transcript: status === 'completed' ? generateMockTranscript() : undefined,
      summary: status === 'completed' ? generateMockSummary(callTopics) : undefined,
      sentiment,
      topics: callTopics,
    }
  })
}

function generateMockTranscript(): string {
  const transcripts = [
    "Caller: Hi, I'd like to schedule an appointment.\nAgent: I'd be happy to help you schedule an appointment. What date works best for you?\nCaller: How about next Tuesday?\nAgent: Tuesday looks good. What time would you prefer?\nCaller: 2 PM would be perfect.\nAgent: Great! I have you scheduled for Tuesday at 2 PM. Is there anything else I can help you with?",
    "Caller: What are your business hours?\nAgent: We're open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM.\nCaller: Do you offer delivery?\nAgent: Yes, we offer delivery within a 5-mile radius for orders over $25.\nCaller: Perfect, thank you!",
    "Caller: I have a question about pricing.\nAgent: I'd be happy to help with pricing information. What specific service are you interested in?\nCaller: I need to know about your consultation fees.\nAgent: Our consultation fee is $150 for a one-hour session. Would you like to book one?"
  ]
  return transcripts[Math.floor(Math.random() * transcripts.length)]
}

function generateMockSummary(topics: string[]): string {
  return `Customer inquiry about ${topics.join(' and ')}. ${Math.random() > 0.5 ? 'Resolved successfully.' : 'Follow-up required.'}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // In production, this would query your database for real call data
    // For now, we'll return mock data
    const calls = generateMockCalls(limit)

    return NextResponse.json({ calls })
  } catch (error) {
    console.error('Calls API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call data' },
      { status: 500 }
    )
  }
}
