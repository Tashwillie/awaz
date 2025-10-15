'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { Phone, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getDemoStatus } from '@/lib/api'

interface SessionStatus {
  status: string
  callStatus?: string
  businessProfile?: any
  call?: {
    id: string
    status: string
    providerCallId: string
    summary?: string
    transcriptUrl?: string
  }
}

export default function DemoSessionPage() {
  const params = useParams()
  const sessionId = params.id as string
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getDemoStatus(sessionId)
        setSessionStatus(status)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      fetchStatus()
      
      // Poll for updates every 2 seconds
      const interval = setInterval(fetchStatus, 2000)
      return () => clearInterval(interval)
    }
  }, [sessionId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'RINGING':
        return <Phone className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'CONNECTED':
        return <MessageCircle className="w-5 h-5 text-green-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return 'Call initiated'
      case 'RINGING':
        return 'Calling you now...'
      case 'CONNECTED':
        return 'Connected! Talk to your AI agent'
      case 'COMPLETED':
        return 'Call completed'
      case 'FAILED':
        return 'Call failed'
      default:
        return 'Unknown status'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your demo session...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Demo Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This demo session could not be found or has expired.'}
          </p>
          <Button onClick={() => window.location.href = '/demo'}>
            Start New Demo
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen brand-gradient">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <Logo />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Session Info */}
          <Card>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Your Demo is Active
            </h1>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Session ID</label>
                <p className="text-gray-900 font-mono text-sm">{sessionId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Business</label>
                <p className="text-gray-900">
                  {sessionStatus.businessProfile?.business_profile?.name || 'Loading...'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Call Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(sessionStatus.callStatus || sessionStatus.status)}
                  <span className="text-gray-900">
                    {getStatusText(sessionStatus.callStatus || sessionStatus.status)}
                  </span>
                </div>
              </div>

              {sessionStatus.call?.summary && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Call Summary</label>
                  <p className="text-gray-900 text-sm mt-1">
                    {sessionStatus.call.summary}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ This call may be recorded for quality assurance purposes.
              </p>
            </div>
          </Card>

          {/* Voice Widget */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Talk to Your AI Agent
            </h2>
            
            {sessionStatus.callStatus === 'COMPLETED' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Demo Completed
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for trying our AI voice demo!
                </p>
                
                {sessionStatus.call?.transcriptUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(sessionStatus.call?.transcriptUrl, '_blank')}
                  >
                    View Transcript
                  </Button>
                )}
              </div>
            ) : sessionStatus.callStatus === 'FAILED' ? (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Call Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  We're sorry, but the demo call could not be completed.
                </p>
                <Button onClick={() => window.location.href = '/demo'}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Voice Widget Placeholder */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="w-20 h-20 bg-brand-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Voice Demo Active
                  </h3>
                  <p className="text-gray-600">
                    The AI agent should be calling you shortly. 
                    Answer your phone to start the demo!
                  </p>
                </div>

                {/* Alternative: Browser Widget */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    Or talk in your browser:
                  </p>
                  {/* Replace with actual voice widget iframe */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">
                      Voice widget will be embedded here
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Business Profile Preview */}
        {sessionStatus.businessProfile && (
          <Card className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your AI Agent's Training Data
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Brand Voice</h3>
                <p className="text-gray-700 text-sm">
                  {sessionStatus.businessProfile.business_profile?.brand_voice || 'Loading...'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {sessionStatus.businessProfile.business_profile?.services?.slice(0, 4).map((service: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-teal-100 text-brand-blue-600 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Chat Support Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 bg-brand-teal-100 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-teal-200 transition-colors duration-200">
          <div className="w-6 h-6 text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5l3 3v-3c1.66 0 3-1.34 3-3s-1.34-3-3-3v-3c1.66 0 3-1.34 3-3s-1.34-3-3-3h-5c-4.41 0-8 3.59-8 8s3.59 8 8 8h1v2c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7v2h-1c-2.76 0-5-2.24-5-5s2.24-5 5-5h5c1.1 0 2 .9 2 2s-.9 2-2 2h-5c-1.66 0-3 1.34-3 3s1.34 3 3 3h1v2h-1c-2.76 0-5-2.24-5-5s2.24-5 5-5h5c1.1 0 2 .9 2 2s-.9 2-2 2h-5c-1.66 0-3 1.34-3 3s1.34 3 3 3h1v2h-1c-2.76 0-5-2.24-5-5s2.24-5 5-5z"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
