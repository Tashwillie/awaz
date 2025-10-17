import { NextRequest, NextResponse } from 'next/server'

interface CallForwardingConfig {
  id: string
  phoneSystemType: 'mobile' | 'voip' | 'pstn' | 'landline'
  provider: string
  userPhoneNumber: string
  funnderPhoneNumber: string
  status: 'active' | 'inactive' | 'pending'
  setupInstructions: string[]
  createdAt: string
}

// Mock call forwarding configurations
const callForwardingConfigs: Record<string, CallForwardingConfig> = {}

const PROVIDER_INSTRUCTIONS = {
  mobile: {
    'verizon': [
      '1. Dial *72 on your phone',
      '2. Enter the Funnder number when prompted',
      '3. Press # to confirm',
      '4. You will hear a confirmation tone'
    ],
    'at&t': [
      '1. Dial *21 on your phone',
      '2. Enter the Funnder number',
      '3. Press # to activate',
      '4. Wait for confirmation message'
    ],
    't-mobile': [
      '1. Open your phone dialer',
      '2. Dial **21*[Funnder Number]#',
      '3. Press the call button',
      '4. You will receive a confirmation'
    ],
    'sprint': [
      '1. Dial *72 on your phone',
      '2. Enter the Funnder number',
      '3. Press # to confirm',
      '4. Listen for activation tone'
    ]
  },
  voip: {
    'ringcentral': [
      '1. Log into your RingCentral account',
      '2. Go to Admin Portal > Phone System > Phones',
      '3. Select your phone number',
      '4. Set Call Forwarding to the Funnder number'
    ],
    'vonage': [
      '1. Log into your Vonage account',
      '2. Navigate to Phone Features',
      '3. Select Call Forwarding',
      '4. Enter the Funnder number'
    ],
    '8x8': [
      '1. Sign in to your 8x8 account',
      '2. Go to Admin Console > Users',
      '3. Select your user > Phone Settings',
      '4. Configure Call Forwarding'
    ]
  },
  pstn: {
    'comcast': [
      '1. Contact Comcast Business Support',
      '2. Request call forwarding setup',
      '3. Provide the Funnder number',
      '4. Wait for activation confirmation'
    ],
    'cox': [
      '1. Call Cox Business Support',
      '2. Request call forwarding feature',
      '3. Provide destination number',
      '4. Confirm activation'
    ]
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

    // Return existing configuration or create new one
    let config = callForwardingConfigs[sessionId]
    if (!config) {
      config = {
        id: `forwarding_${sessionId}`,
        phoneSystemType: 'mobile',
        provider: 'verizon',
        userPhoneNumber: '',
        funnderPhoneNumber: '+16516613101', // Default Funnder number
        status: 'inactive',
        setupInstructions: [],
        createdAt: new Date().toISOString()
      }
      callForwardingConfigs[sessionId] = config
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Call forwarding GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call forwarding configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, phoneSystemType, provider, userPhoneNumber, funnderPhoneNumber } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Generate setup instructions based on phone system type and provider
    const instructions = PROVIDER_INSTRUCTIONS[phoneSystemType]?.[provider] || [
      'Please contact your phone service provider for call forwarding setup instructions.'
    ]

    const config: CallForwardingConfig = {
      id: `forwarding_${sessionId}`,
      phoneSystemType,
      provider,
      userPhoneNumber,
      funnderPhoneNumber,
      status: 'pending',
      setupInstructions: instructions,
      createdAt: new Date().toISOString()
    }

    callForwardingConfigs[sessionId] = config

    return NextResponse.json({
      success: true,
      message: 'Call forwarding configuration created',
      config
    })
  } catch (error) {
    console.error('Call forwarding POST error:', error)
    return NextResponse.json(
      { error: 'Failed to configure call forwarding' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, status } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const existingConfig = callForwardingConfigs[sessionId]
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Call forwarding configuration not found' },
        { status: 404 }
      )
    }

    const updatedConfig: CallForwardingConfig = {
      ...existingConfig,
      status: status || existingConfig.status
    }

    callForwardingConfigs[sessionId] = updatedConfig

    return NextResponse.json({
      success: true,
      message: 'Call forwarding status updated',
      config: updatedConfig
    })
  } catch (error) {
    console.error('Call forwarding PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update call forwarding status' },
      { status: 500 }
    )
  }
}
