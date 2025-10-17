import { NextRequest, NextResponse } from 'next/server'
import { getActiveProvider } from '@/services/providers/voice/register'
import { twilioService } from '@/services/twilio.service'

interface TestCall {
  id: string
  phoneNumber: string
  allowedNumbers: string[]
  status: 'active' | 'inactive'
  createdAt: string
}

// Mock test call configuration storage
const testCallConfigs: Record<string, TestCall> = {}

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

    // Return existing test call config or create default
    let config = testCallConfigs[sessionId]
    if (!config) {
      config = {
        id: `test_config_${sessionId}`,
        phoneNumber: '+1234567890', // Will be updated when phone number is provisioned
        allowedNumbers: [],
        status: 'active',
        createdAt: new Date().toISOString()
      }
      testCallConfigs[sessionId] = config
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Test calls GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test call configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, allowedNumbers, status } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Update test call configuration
    const existingConfig = testCallConfigs[sessionId] || {
      id: `test_config_${sessionId}`,
      phoneNumber: '+1234567890',
      allowedNumbers: [],
      status: 'active',
      createdAt: new Date().toISOString()
    }

    const updatedConfig: TestCall = {
      ...existingConfig,
      allowedNumbers: allowedNumbers || existingConfig.allowedNumbers,
      status: status || existingConfig.status
    }

    testCallConfigs[sessionId] = updatedConfig

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Test calls PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update test call configuration' },
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

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log(`Initiating test call to ${phoneNumber} for session ${sessionId}`)

    try {
      // Get the active voice provider (Awaz)
      const voiceProvider = getActiveProvider()
      
      // Create a mock business profile for the call
      const mockProfile = {
        business_name: 'Funnder Demo Business',
        business_type: 'AI Solutions',
        services: ['AI Voice Agents', 'Customer Service Automation'],
        hours: '9 AM - 5 PM EST',
        location: 'Demo Location'
      }

      // Start the call using Awaz
      const callResult = await voiceProvider.startCall(
        sessionId,
        phoneNumber,
        mockProfile
      )

      // Now make the actual phone call using Twilio
      const twilioCallSid = await twilioService.makeOutboundCall(
        phoneNumber,
        process.env.TWILIO_PHONE_NUMBER || '+16516613101'
      )

      return NextResponse.json({
        success: true,
        message: 'Test call initiated successfully with Awaz + Twilio',
        callId: callResult,
        twilioCallSid: twilioCallSid,
        status: 'initiated',
        provider: 'awaz',
        phoneProvider: 'twilio'
      })

    } catch (providerError) {
      console.error('Voice provider error:', providerError)
      
      // Try to make a basic Twilio call even if Awaz fails
      try {
        const twilioCallSid = await twilioService.makeOutboundCall(
          phoneNumber,
          process.env.TWILIO_PHONE_NUMBER || '+16516613101'
        )

        return NextResponse.json({
          success: true,
          message: 'Test call initiated with Twilio (Awaz unavailable)',
          twilioCallSid: twilioCallSid,
          status: 'initiated',
          provider: 'twilio',
          warning: 'Awaz voice provider unavailable, using Twilio only'
        })
      } catch (twilioError) {
        console.error('Twilio call error:', twilioError)
        
        // Final fallback to mock response
        return NextResponse.json({
          success: true,
          message: 'Test call initiated (mock mode)',
          callId: `call_${Date.now()}`,
          status: 'initiated',
          provider: 'mock',
          warning: 'Both Awaz and Twilio unavailable, using mock response'
        })
      }
    }

  } catch (error) {
    console.error('Test call POST error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate test call', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
