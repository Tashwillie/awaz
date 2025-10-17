'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Loader2, Volume2 } from 'lucide-react'

interface VoicePlayerProps {
  title: string
  text: string
  voiceType?: 'greeting' | 'message'
  businessName?: string
  className?: string
}

export function VoicePlayer({ 
  title, 
  text, 
  voiceType = 'greeting',
  businessName = 'your business',
  className = '' 
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Generate the appropriate text based on voice type
  const getVoiceText = () => {
    if (voiceType === 'greeting') {
      return `Hello! Thank you for calling ${businessName}. This is your AI assistant. How can I help you today?`
    } else if (voiceType === 'message') {
      return `Hi there! I'm the AI assistant for ${businessName}. I can help you with information about our services, answer questions, or connect you with the right person. What would you like to know?`
    }
    return text
  }

  const generateVoice = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: getVoiceText(),
          voiceType,
          businessName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate voice')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Voice generation error:', err)
      
      // Check if it's an API key issue
      if (err instanceof Error && err.message.includes('API key not configured')) {
        setError('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file.')
      } else {
        setError('Failed to generate voice. Please check your OpenAI API key and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = () => {
    if (isLoading) return

    if (!audioRef.current || !audioRef.current.src) {
      generateVoice()
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
  }

  const handleAudioError = () => {
    setIsPlaying(false)
    setError('Audio playback failed. Please try again.')
  }

  // Cleanup audio URL when component unmounts
  useEffect(() => {
    const audioElement = audioRef.current
    return () => {
      if (audioElement?.src) {
        URL.revokeObjectURL(audioElement.src)
      }
    }
  }, [])

  return (
    <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-brand-teal-100 hover:bg-brand-teal-200'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        
        <div className="flex-1">
          <p className="font-medium text-gray-900">{title}</p>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          {isPlaying && (
            <div className="flex items-center space-x-1 mt-1">
              <Volume2 className="w-3 h-3 text-brand-teal-100" />
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-brand-teal-100 rounded-full animate-pulse" />
                <div className="w-1 h-2 bg-brand-teal-100 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-4 bg-brand-teal-100 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-2 bg-brand-teal-100 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 h-3 bg-brand-teal-100 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={handleAudioError}
        preload="none"
      />
    </div>
  )
}
