import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TrainingRequest {
  businessName?: string
  websiteUrl?: string
  steps: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: TrainingRequest = await request.json()
    const { businessName, websiteUrl, steps } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Simulate training steps with OpenAI
    const trainingResults = []

    for (const step of steps) {
      let prompt = ''
      let response = ''

      switch (step) {
        case 'analyze':
          prompt = `Analyze the business "${businessName}" with website "${websiteUrl}". Extract key business information including services, location, hours, and unique selling points.`
          response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
          })
          break

        case 'process':
          prompt = `Process the business information for "${businessName}" and create a comprehensive business profile suitable for an AI voice agent. Include common customer questions and appropriate responses.`
          response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 800,
          })
          break

        case 'optimize':
          prompt = `Optimize the business data for "${businessName}" for AI voice interaction. Create natural conversation flows and identify key information that should be prioritized in customer interactions.`
          response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 600,
          })
          break

        case 'generate':
          prompt = `Generate a custom AI voice agent personality for "${businessName}". Include tone, speaking style, and key phrases that align with the business brand.`
          response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 700,
          })
          break

        default:
          continue
      }

      trainingResults.push({
        step,
        status: 'completed',
        result: response.choices[0]?.message?.content || 'Training completed',
        timestamp: new Date().toISOString(),
      })
    }

    // Store the training results (you might want to save this to a database)
    const trainingSession = {
      id: `training_${Date.now()}`,
      businessName,
      websiteUrl,
      steps: trainingResults,
      createdAt: new Date().toISOString(),
      status: 'completed',
    }

    return NextResponse.json({
      success: true,
      trainingSession,
      message: 'Agent training completed successfully',
    })

  } catch (error) {
    console.error('Training error:', error)
    
    return NextResponse.json(
      { 
        error: 'Training failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'train-agent',
    timestamp: new Date().toISOString(),
  })
}
