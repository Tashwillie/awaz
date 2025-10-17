#!/usr/bin/env tsx

/**
 * Database initialization script
 * Creates initial data for development and testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initializing database...')

  try {
    // Create a sample session with all related data
    const sampleSessionId = 'sample-session-' + Date.now()
    
    // Create demo session
    const demoSession = await prisma.demoSession.create({
      data: {
        id: sampleSessionId,
        status: 'READY',
        provider: 'awaz',
        ttlExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        providerAgentId: 'sample-agent-123',
        sourceIpHash: 'sample-ip-hash',
        requestId: 'sample-request-123'
      }
    })

    // Create lead
    await prisma.lead.create({
      data: {
        demoSessionId: sampleSessionId,
        name: 'John Doe',
        email: 'john@example.com',
        phoneE164: '+1234567890',
        consent: true
      }
    })

    // Create business context
    await prisma.businessContext.create({
      data: {
        demoSessionId: sampleSessionId,
        placeId: 'sample-place-123',
        name: 'Sample Business',
        address: '123 Main St, City, State 12345',
        website: 'https://example.com',
        phone: '+1234567890',
        types: ['restaurant', 'food'],
        rating: 4.5,
        userRatings: 150,
        hoursJson: {
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 5:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        geoLat: 40.7128,
        geoLng: -74.0060
      }
    })

    // Create business profile
    await prisma.businessProfile.create({
      data: {
        demoSessionId: sampleSessionId,
        json: {
          business_name: 'Sample Business',
          brand_voice: 'Friendly and Professional',
          services: ['Food Delivery', 'Catering', 'Dine-in'],
          coverage_area: '5-mile radius',
          hours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '10:00 AM - 4:00 PM',
            sunday: 'Closed'
          },
          pricing_notes: ['Free delivery on orders over $25', '10% discount for first-time customers'],
          booking_rules: ['24-hour advance notice required', 'Minimum order of $15'],
          faqs: [
            {
              question: 'What are your delivery hours?',
              answer: 'We deliver Monday through Friday from 11 AM to 9 PM, and Saturday from 12 PM to 8 PM.'
            },
            {
              question: 'Do you offer catering services?',
              answer: 'Yes, we offer catering for events of 10 or more people. Please call 24 hours in advance.'
            }
          ],
          prohibited_claims: ['We cannot guarantee delivery times during peak hours']
        }
      }
    })

    // Create sample calls
    await prisma.call.createMany({
      data: [
        {
          demoSessionId: sampleSessionId,
          provider: 'awaz',
          providerCallId: 'awaz-call-1',
          twilioCallSid: 'CA1234567890abcdef1234567890abcdef',
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          connectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 30 seconds later
          endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000), // 2 minutes later
          durationSec: 90,
          summary: 'Customer called to inquire about delivery options and placed an order.',
          rating: 5
        },
        {
          demoSessionId: sampleSessionId,
          provider: 'awaz',
          providerCallId: 'awaz-call-2',
          twilioCallSid: 'CA1234567890abcdef1234567890abcdef2',
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          connectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15000), // 15 seconds later
          endedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 3 * 60 * 1000), // 3 minutes later
          durationSec: 165,
          summary: 'Customer asked about catering services and pricing.',
          rating: 4
        },
        {
          demoSessionId: sampleSessionId,
          provider: 'awaz',
          providerCallId: 'awaz-call-3',
          twilioCallSid: 'CA1234567890abcdef1234567890abcdef3',
          status: 'FAILED',
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          endedAt: new Date(Date.now() - 30 * 60 * 1000 + 10000), // 10 seconds later
          durationSec: 10
        }
      ]
    })

    // Create phone number
    await prisma.phoneNumber.create({
      data: {
        sessionId: sampleSessionId,
        twilioSid: 'PN1234567890abcdef1234567890abcdef',
        number: '+16515551234',
        areaCode: '651',
        city: 'Saint Paul',
        state: 'MN',
        country: 'US',
        status: 'ACTIVE',
        provider: 'twilio'
      }
    })

    // Create agent config
    await prisma.agentConfig.create({
      data: {
        sessionId: sampleSessionId,
        agentName: 'Funnder AI',
        greeting: 'Hello, thank you for calling Sample Business. Our call may be recorded today for quality control purposes. My name is Funnder, how can I help you?',
        backgroundNoise: 'Office',
        includeRecordingDisclaimer: true,
        faqs: [
          {
            question: 'What are your business hours?',
            answer: 'We are open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM.'
          },
          {
            question: 'Do you offer delivery?',
            answer: 'Yes, we offer delivery within a 5-mile radius for orders over $25.'
          }
        ],
        customQuestions: [
          'What services do you offer?',
          'How can I make an appointment?',
          'What are your prices?'
        ],
        status: 'active'
      }
    })

    // Create billing info
    await prisma.billingInfo.create({
      data: {
        sessionId: sampleSessionId,
        trialMinutes: 60,
        usedMinutes: 4, // 4 minutes used from sample calls
        remainingMinutes: 56,
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        hasPaymentMethod: false,
        status: 'trial',
        plan: 'trial',
        pricePerMinute: 0.02
      }
    })

    // Create call metrics
    await prisma.callMetrics.create({
      data: {
        sessionId: sampleSessionId,
        totalCalls: 3,
        answeredCalls: 2,
        missedCalls: 1,
        averageDuration: 127.5, // (90 + 165) / 2
        successRate: 66.67 // (2/3) * 100
      }
    })

    console.log('✅ Database initialized successfully!')
    console.log(`📋 Sample session ID: ${sampleSessionId}`)
    console.log('🔗 You can use this session ID to test the dashboard APIs')

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
