import { NextRequest, NextResponse } from 'next/server'

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

// Mock billing storage - in production, this would integrate with Stripe
const billingInfo: Record<string, BillingInfo> = {}

function generateMockBillingInfo(): BillingInfo {
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 7) // 7-day trial

  return {
    trialMinutes: 25,
    usedMinutes: Math.floor(Math.random() * 5), // 0-5 minutes used
    remainingMinutes: 25 - Math.floor(Math.random() * 5),
    trialEndDate: trialEndDate.toISOString(),
    hasPaymentMethod: false,
    status: 'trial',
    plan: 'trial',
    pricePerMinute: 0.10 // $0.10 per minute after trial
  }
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

    // Return existing billing info or create new trial
    let billing = billingInfo[sessionId]
    if (!billing) {
      billing = generateMockBillingInfo()
      billingInfo[sessionId] = billing
    }

    return NextResponse.json(billing)
  } catch (error) {
    console.error('Billing GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, action } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (action === 'start_trial') {
      // Start free trial
      const billing = generateMockBillingInfo()
      billingInfo[sessionId] = billing

      return NextResponse.json({
        success: true,
        message: 'Free trial started successfully',
        billing
      })
    }

    if (action === 'add_payment_method') {
      // In production, this would integrate with Stripe
      const existingBilling = billingInfo[sessionId] || generateMockBillingInfo()
      
      // Mock successful payment method addition
      const updatedBilling: BillingInfo = {
        ...existingBilling,
        hasPaymentMethod: true,
        status: 'active',
        plan: 'basic'
      }
      
      billingInfo[sessionId] = updatedBilling

      return NextResponse.json({
        success: true,
        message: 'Payment method added successfully',
        billing: updatedBilling
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Billing POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process billing request' },
      { status: 500 }
    )
  }
}
