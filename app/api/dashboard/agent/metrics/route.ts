import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CallMetrics {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  averageDuration: number
  successRate: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get call metrics from database
    const calls = await prisma.call.findMany({
      where: { demoSessionId: sessionId }
    })

    // Calculate metrics
    const totalCalls = calls.length
    const answeredCalls = calls.filter(call => call.status === 'COMPLETED').length
    const missedCalls = calls.filter(call => call.status === 'FAILED').length
    const completedCalls = calls.filter(call => call.status === 'COMPLETED' && call.durationSec)
    const averageDuration = completedCalls.length > 0 
      ? completedCalls.reduce((sum, call) => sum + (call.durationSec || 0), 0) / completedCalls.length
      : 0
    const successRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0

    // Try to get or create CallMetrics record
    let callMetrics = await prisma.callMetrics.findUnique({
      where: { sessionId }
    })

    if (!callMetrics) {
      callMetrics = await prisma.callMetrics.create({
        data: {
          sessionId,
          totalCalls,
          answeredCalls,
          missedCalls,
          averageDuration,
          successRate
        }
      })
    } else {
      // Update existing metrics
      callMetrics = await prisma.callMetrics.update({
        where: { sessionId },
        data: {
          totalCalls,
          answeredCalls,
          missedCalls,
          averageDuration,
          successRate
        }
      })
    }

    const response: CallMetrics = {
      totalCalls: callMetrics.totalCalls,
      answeredCalls: callMetrics.answeredCalls,
      missedCalls: callMetrics.missedCalls,
      averageDuration: callMetrics.averageDuration,
      successRate: callMetrics.successRate
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Metrics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
