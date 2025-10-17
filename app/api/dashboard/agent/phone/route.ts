import { NextRequest, NextResponse } from 'next/server'
import { twilioService } from '@/services/twilio.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PhoneNumber {
  id: string
  number: string
  areaCode: string
  city: string
  state: string
  country: string
  status: 'active' | 'inactive' | 'pending'
  provider: string
}

// Mock Twilio-like phone number provisioning
function generateMockPhoneNumber(areaCode?: string): PhoneNumber {
  const defaultAreaCode = areaCode || '651'
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000
  const phoneNumber = `+1${defaultAreaCode}${randomSuffix}`
  
  return {
    id: `phone_${Date.now()}`,
    number: phoneNumber,
    areaCode: defaultAreaCode,
    city: 'Minneapolis', // Default city for 651 area code
    state: 'MN',
    country: 'US',
    status: 'active',
    provider: 'twilio'
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

    // Try to get existing phone number from database
    let phoneNumber = await prisma.phoneNumber.findFirst({
      where: { sessionId }
    })

    if (!phoneNumber) {
      // Create a mock phone number for demo purposes
      const mockPhone = generateMockPhoneNumber()
      phoneNumber = await prisma.phoneNumber.create({
        data: {
          sessionId,
          twilioSid: `mock_${Date.now()}`,
          number: mockPhone.number,
          areaCode: mockPhone.areaCode,
          city: mockPhone.city,
          state: mockPhone.state,
          country: mockPhone.country,
          status: mockPhone.status.toUpperCase() as any,
          provider: mockPhone.provider
        }
      })
    }

    // Convert to API response format
    const response: PhoneNumber = {
      id: phoneNumber.id,
      number: phoneNumber.number,
      areaCode: phoneNumber.areaCode,
      city: phoneNumber.city,
      state: phoneNumber.state,
      country: phoneNumber.country,
      status: phoneNumber.status.toLowerCase() as any,
      provider: phoneNumber.provider
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Phone number GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch phone number' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, areaCode } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    try {
      // Try to purchase a real phone number from Twilio
      const newPhoneNumber = await twilioService.purchasePhoneNumber(areaCode)
      
      // Store in database
      const dbPhoneNumber = await prisma.phoneNumber.create({
        data: {
          sessionId,
          twilioSid: newPhoneNumber.id,
          number: newPhoneNumber.number,
          areaCode: newPhoneNumber.areaCode,
          city: newPhoneNumber.city,
          state: newPhoneNumber.state,
          country: newPhoneNumber.country,
          status: newPhoneNumber.status.toUpperCase() as any,
          provider: newPhoneNumber.provider
        }
      })

      // Convert to API response format
      const response: PhoneNumber = {
        id: dbPhoneNumber.id,
        number: dbPhoneNumber.number,
        areaCode: dbPhoneNumber.areaCode,
        city: dbPhoneNumber.city,
        state: dbPhoneNumber.state,
        country: dbPhoneNumber.country,
        status: dbPhoneNumber.status.toLowerCase() as any,
        provider: dbPhoneNumber.provider
      }

      return NextResponse.json(response)
    } catch (twilioError) {
      console.error('Twilio phone number purchase failed:', twilioError)
      
      // Fallback to mock phone number if Twilio fails
      const mockPhoneNumber = generateMockPhoneNumber(areaCode)
      
      // Store mock phone number in database
      const dbPhoneNumber = await prisma.phoneNumber.create({
        data: {
          sessionId,
          twilioSid: `mock_${Date.now()}`,
          number: mockPhoneNumber.number,
          areaCode: mockPhoneNumber.areaCode,
          city: mockPhoneNumber.city,
          state: mockPhoneNumber.state,
          country: mockPhoneNumber.country,
          status: mockPhoneNumber.status.toUpperCase() as any,
          provider: mockPhoneNumber.provider
        }
      })

      const response: PhoneNumber = {
        id: dbPhoneNumber.id,
        number: dbPhoneNumber.number,
        areaCode: dbPhoneNumber.areaCode,
        city: dbPhoneNumber.city,
        state: dbPhoneNumber.state,
        country: dbPhoneNumber.country,
        status: dbPhoneNumber.status.toLowerCase() as any,
        provider: dbPhoneNumber.provider
      }

      return NextResponse.json({
        ...response,
        warning: 'Using mock phone number - Twilio purchase failed'
      })
    }

  } catch (error) {
    console.error('Phone number POST error:', error)
    return NextResponse.json(
      { error: 'Failed to provision phone number', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
