import { NextRequest, NextResponse } from 'next/server'

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

    // In a real implementation, this would:
    // 1. Use Twilio to make an outbound call to the user's phone
    // 2. Connect the call to the AI agent via the voice provider
    // 3. Return call status

    console.log(`Initiating test call to ${phoneNumber} for session ${sessionId}`)

    // Mock response - in production this would be async
    return NextResponse.json({
      success: true,
      message: 'Test call initiated successfully',
      callId: `call_${Date.now()}`,
      status: 'initiated'
    })

  } catch (error) {
    console.error('Test call POST error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate test call' },
      { status: 500 }
    )
  }
}
