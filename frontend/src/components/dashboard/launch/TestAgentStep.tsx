'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { 
  getPhoneNumber, 
  requestNewPhoneNumber,
  startTestCall
} from '@/lib/dashboard-api'

interface TestAgentStepProps {
  sessionId?: string
}

export function TestAgentStep({ sessionId }: TestAgentStepProps) {
  const [phoneNumber, setPhoneNumber] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadData()
    }
  }, [sessionId, loadData])

  const loadData = useCallback(async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      const phone = await getPhoneNumber(sessionId)
      setPhoneNumber(phone)
    } catch (err) {
      console.error('Failed to load test agent data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const handleRequestNewAreaCode = async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      const newPhone = await requestNewPhoneNumber(sessionId, '651') // Default to 651
      setPhoneNumber(newPhone)
    } catch (err) {
      console.error('Failed to request new phone number:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestCall = async () => {
    if (!sessionId || !phoneNumber) return
    
    try {
      setIsLoading(true)
      await startTestCall(sessionId, phoneNumber.number)
      // In a real implementation, this would initiate a call
      alert('Test call initiated! Check your phone.')
    } catch (err) {
      console.error('Failed to start test call:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageTestNumbers = async () => {
    // In a real implementation, this would open a modal to manage test numbers
    alert('Test number management would open here')
  }

  if (isLoading && !phoneNumber) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-teal-100" />
          <span className="ml-2 text-gray-600">Loading test agent setup...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-teal-100 text-white flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Test Your Agent</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
          TEST MODE
        </span>
      </div>
      
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm p-3 mb-4">
        During test mode, your agent can only receive calls from designated testing numbers. 
        No external callers will be able to reach your agent. Calls from test numbers won&apos;t 
        count against your minutes.
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Allow test calls from:</div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              We&apos;ll automatically capture your phone number when you make your first test call. 
              Give it a try!
            </div>
            <button 
              onClick={handleManageTestNumbers}
              className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 transition-colors duration-200"
            >
              Manage
            </button>
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-2">Your Funnder Number</div>
              <button 
                onClick={handleTestCall}
                disabled={isLoading}
                className="w-full bg-brand-teal-100 text-white py-2 rounded-lg mb-1 hover:bg-brand-teal-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Calling...
                  </div>
                ) : (
                  'Call'
                )}
              </button>
              <div className="text-center font-semibold text-gray-900">
                {phoneNumber ? phoneNumber.number : '(651) 661-3101'}
              </div>
              <div 
                onClick={handleRequestNewAreaCode}
                className="text-center text-xs text-gray-500 mt-1 underline hover:text-gray-700 cursor-pointer"
              >
                Request local area code
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">Try asking...</div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>Tell me about your services?</li>
                <li>What services do you offer?</li>
                <li>Are you open tomorrow?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
