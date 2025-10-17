import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CustomizeState {
  currentStep: number
  faqs: Array<{
    id: string
    question: string
    answer: string
  }>
  editingFaqs: boolean
  agentName: string
  backgroundNoise: string
  editingAgent: boolean
  greeting: string
  includeRecordingDisclaimer: boolean
  editingGreeting: boolean
  customQuestions: string[]
  editingCustomQs: boolean
}

const DEFAULT_CONFIG: CustomizeState = {
  currentStep: 1,
  faqs: [
    {
      id: 'faq_1',
      question: 'What are your business hours?',
      answer: 'We are open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM.'
    },
    {
      id: 'faq_2',
      question: 'Do you offer delivery?',
      answer: 'Yes, we offer delivery within a 5-mile radius for orders over $25.'
    }
  ],
  editingFaqs: true,
  agentName: 'Funnder AI',
  backgroundNoise: 'Office',
  editingAgent: true,
  greeting: 'Hello, thank you for calling. Our call may be recorded today for quality control purposes. My name is Funnder, how can I help you?',
  includeRecordingDisclaimer: true,
  editingGreeting: true,
  customQuestions: [
    'What services do you offer?',
    'How can I make an appointment?',
    'What are your prices?'
  ],
  editingCustomQs: true,
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

    // Try to get config from database
    let dbConfig = await prisma.agentConfig.findUnique({
      where: { sessionId }
    })

    if (!dbConfig) {
      // Create default config in database
      dbConfig = await prisma.agentConfig.create({
        data: {
          sessionId,
          agentName: DEFAULT_CONFIG.agentName,
          greeting: DEFAULT_CONFIG.greeting,
          backgroundNoise: DEFAULT_CONFIG.backgroundNoise,
          includeRecordingDisclaimer: DEFAULT_CONFIG.includeRecordingDisclaimer,
          faqs: DEFAULT_CONFIG.faqs,
          customQuestions: DEFAULT_CONFIG.customQuestions
        }
      })
    }

    // Convert database config to CustomizeState format
    const config: CustomizeState = {
      currentStep: DEFAULT_CONFIG.currentStep,
      faqs: (dbConfig.faqs as any) || DEFAULT_CONFIG.faqs,
      editingFaqs: DEFAULT_CONFIG.editingFaqs,
      agentName: dbConfig.agentName,
      backgroundNoise: dbConfig.backgroundNoise,
      editingAgent: DEFAULT_CONFIG.editingAgent,
      greeting: dbConfig.greeting,
      includeRecordingDisclaimer: dbConfig.includeRecordingDisclaimer,
      editingGreeting: DEFAULT_CONFIG.editingGreeting,
      customQuestions: dbConfig.customQuestions || DEFAULT_CONFIG.customQuestions,
      editingCustomQs: DEFAULT_CONFIG.editingCustomQs
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Agent config GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, config } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get existing config from database
    let dbConfig = await prisma.agentConfig.findUnique({
      where: { sessionId }
    })

    if (!dbConfig) {
      // Create new config if it doesn't exist
      dbConfig = await prisma.agentConfig.create({
        data: {
          sessionId,
          agentName: config.agentName || DEFAULT_CONFIG.agentName,
          greeting: config.greeting || DEFAULT_CONFIG.greeting,
          backgroundNoise: config.backgroundNoise || DEFAULT_CONFIG.backgroundNoise,
          includeRecordingDisclaimer: config.includeRecordingDisclaimer ?? DEFAULT_CONFIG.includeRecordingDisclaimer,
          faqs: config.faqs || DEFAULT_CONFIG.faqs,
          customQuestions: config.customQuestions || DEFAULT_CONFIG.customQuestions
        }
      })
    } else {
      // Update existing config
      dbConfig = await prisma.agentConfig.update({
        where: { sessionId },
        data: {
          agentName: config.agentName || dbConfig.agentName,
          greeting: config.greeting || dbConfig.greeting,
          backgroundNoise: config.backgroundNoise || dbConfig.backgroundNoise,
          includeRecordingDisclaimer: config.includeRecordingDisclaimer ?? dbConfig.includeRecordingDisclaimer,
          faqs: config.faqs || dbConfig.faqs,
          customQuestions: config.customQuestions || dbConfig.customQuestions
        }
      })
    }

    // Convert database config to CustomizeState format
    const updatedConfig: CustomizeState = {
      currentStep: config.currentStep || DEFAULT_CONFIG.currentStep,
      faqs: (dbConfig.faqs as any) || DEFAULT_CONFIG.faqs,
      editingFaqs: config.editingFaqs ?? DEFAULT_CONFIG.editingFaqs,
      agentName: dbConfig.agentName,
      backgroundNoise: dbConfig.backgroundNoise,
      editingAgent: config.editingAgent ?? DEFAULT_CONFIG.editingAgent,
      greeting: dbConfig.greeting,
      includeRecordingDisclaimer: dbConfig.includeRecordingDisclaimer,
      editingGreeting: config.editingGreeting ?? DEFAULT_CONFIG.editingGreeting,
      customQuestions: dbConfig.customQuestions || DEFAULT_CONFIG.customQuestions,
      editingCustomQs: config.editingCustomQs ?? DEFAULT_CONFIG.editingCustomQs
    }

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Agent config PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update agent configuration' },
      { status: 500 }
    )
  }
}
