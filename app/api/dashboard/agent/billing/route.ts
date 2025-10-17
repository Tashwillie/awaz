import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface BillingInfo {
  trialMinutes: number
  usedMinutes: number
  remainingMinutes: number
  trialEndDate: string
  hasPaymentMethod: boolean
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  plan: 'trial' | 'basic' | 'premium'
  pricePerMinute: number
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

    // Try to get billing info from database
    let billingInfo = await prisma.billingInfo.findUnique({
      where: { sessionId }
    })

    if (!billingInfo) {
      // Create default billing info for new session
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 7) // 7-day trial

      billingInfo = await prisma.billingInfo.create({
        data: {
          sessionId,
          trialMinutes: 60,
          usedMinutes: 0,
          remainingMinutes: 60,
          trialEndDate,
          hasPaymentMethod: false,
          status: 'trial',
          plan: 'trial',
          pricePerMinute: 0.02
        }
      })
    }

    // Convert to API response format
    const response: BillingInfo = {
      trialMinutes: billingInfo.trialMinutes,
      usedMinutes: billingInfo.usedMinutes,
      remainingMinutes: billingInfo.remainingMinutes,
      trialEndDate: billingInfo.trialEndDate.toISOString(),
      hasPaymentMethod: billingInfo.hasPaymentMethod,
      status: billingInfo.status as any,
      plan: billingInfo.plan as any,
      pricePerMinute: billingInfo.pricePerMinute
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Billing info GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, billingInfo } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Update billing info in database
    const updatedBillingInfo = await prisma.billingInfo.upsert({
      where: { sessionId },
      update: {
        trialMinutes: billingInfo.trialMinutes,
        usedMinutes: billingInfo.usedMinutes,
        remainingMinutes: billingInfo.remainingMinutes,
        trialEndDate: new Date(billingInfo.trialEndDate),
        hasPaymentMethod: billingInfo.hasPaymentMethod,
        status: billingInfo.status,
        plan: billingInfo.plan,
        pricePerMinute: billingInfo.pricePerMinute
      },
      create: {
        sessionId,
        trialMinutes: billingInfo.trialMinutes || 60,
        usedMinutes: billingInfo.usedMinutes || 0,
        remainingMinutes: billingInfo.remainingMinutes || 60,
        trialEndDate: new Date(billingInfo.trialEndDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
        hasPaymentMethod: billingInfo.hasPaymentMethod || false,
        status: billingInfo.status || 'trial',
        plan: billingInfo.plan || 'trial',
        pricePerMinute: billingInfo.pricePerMinute || 0.02
      }
    })

    // Convert to API response format
    const response: BillingInfo = {
      trialMinutes: updatedBillingInfo.trialMinutes,
      usedMinutes: updatedBillingInfo.usedMinutes,
      remainingMinutes: updatedBillingInfo.remainingMinutes,
      trialEndDate: updatedBillingInfo.trialEndDate.toISOString(),
      hasPaymentMethod: updatedBillingInfo.hasPaymentMethod,
      status: updatedBillingInfo.status as any,
      plan: updatedBillingInfo.plan as any,
      pricePerMinute: updatedBillingInfo.pricePerMinute
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Billing info PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update billing information' },
      { status: 500 }
    )
  }
}
