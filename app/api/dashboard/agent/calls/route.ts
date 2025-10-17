import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Call {
  id: string
  timestamp: string
  duration: number
  status: 'completed' | 'missed' | 'in-progress'
  caller: string
  summary?: string
  rating?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get calls from database for this session
    const dbCalls = await prisma.call.findMany({
      where: { 
        demoSessionId: sessionId,
        status: {
          in: ['CONNECTED', 'COMPLETED']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Convert to API response format
    const calls: Call[] = dbCalls.map(call => ({
      id: call.id,
      timestamp: call.createdAt.toISOString(),
      duration: call.durationSec || 0,
      status: call.status.toLowerCase() as any,
      caller: 'Unknown', // We'd need to get this from the demo session or lead
      summary: call.summary || undefined,
      rating: call.rating || undefined
    }))

    return NextResponse.json(calls)
  } catch (error) {
    console.error('Calls GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, phoneNumber } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // For now, just return success - the actual call will be handled by Twilio webhooks
    return NextResponse.json({ 
      message: 'Test call initiated',
      callId: `test_${Date.now()}`
    })
  } catch (error) {
    console.error('Test call POST error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate test call' },
      { status: 500 }
    )
  }
}
