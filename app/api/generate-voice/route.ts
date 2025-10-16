import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface VoiceGenerationRequest {
  text: string
  voiceType: 'greeting' | 'message'
  businessName?: string
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceGenerationRequest = await request.json()
    const { text, voiceType, businessName, voice = 'nova' } = body

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables')
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          message: 'Please set OPENAI_API_KEY in your .env.local file'
        },
        { status: 500 }
      )
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for voice generation' },
        { status: 400 }
      )
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      response_format: 'mp3',
      speed: 1.0,
    })

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return the audio as a response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Voice generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Voice generation failed',
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
    service: 'generate-voice',
    timestamp: new Date().toISOString(),
    supportedVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  })
}
