'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { 
  getCallForwardingConfig, 
  configureCallForwarding,
  getPhoneNumber
} from '@/lib/dashboard-api'

interface AnswerCallsStepProps {
  sessionId?: string
}

export function AnswerCallsStep({ sessionId }: AnswerCallsStepProps) {
  const [forwardingConfig, setForwardingConfig] = useState<any>(null)
  const [phoneNumber, setPhoneNumber] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<'forward' | 'use_funnder'>('forward')
  const [phoneSystemType, setPhoneSystemType] = useState<'mobile' | 'voip' | 'pstn' | 'landline'>('mobile')
  const [provider, setProvider] = useState('verizon')
  const [userPhoneNumber, setUserPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadData()
    }
  }, [sessionId])

  const loadData = async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      const [forwarding, phone] = await Promise.all([
        getCallForwardingConfig(sessionId),
        getPhoneNumber(sessionId)
      ])
      setForwardingConfig(forwarding)
      setPhoneNumber(phone)
    } catch (err) {
      console.error('Failed to load call forwarding data:', err)
      setError('Failed to load call forwarding data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigureForwarding = async () => {
    if (!sessionId || !userPhoneNumber) return
    
    try {
      setIsLoading(true)
      const result = await configureCallForwarding(
        sessionId,
        phoneSystemType,
        provider,
        userPhoneNumber,
        phoneNumber?.number || '+16516613101'
      )
      if (result.success) {
        setForwardingConfig(result.config)
        alert('Call forwarding configured! Follow the setup instructions.')
      } else {
        setError('Failed to configure call forwarding')
      }
    } catch (err) {
      console.error('Failed to configure call forwarding:', err)
      setError('Failed to configure call forwarding')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !forwardingConfig) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-teal-100" />
          <span className="ml-2 text-gray-600">Loading call forwarding setup...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-brand-teal-100 text-white flex items-center justify-center text-sm font-semibold">
          3
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Have Funnder Start Answering Your Calls</h3>
      </div>
      
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm p-3 mb-5">
        Funnder will not answer calls from external numbers until you've started your free trial. 
        If external callers attempt to reach your agent, they will hear an automated message 
        indicating they can't be connected. Start free trial by completing setup and adding a credit card.
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <button 
          onClick={() => setSelectedOption('forward')}
          className={`p-4 rounded-xl border-2 text-left hover:bg-gray-50 transition-colors duration-200 ${
            selectedOption === 'forward' 
              ? 'border-brand-teal-100 bg-white' 
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="font-semibold text-gray-900">Forward Calls</div>
          <div className="text-sm text-gray-600">Send calls from your existing number to Funnder.</div>
        </button>
        <button 
          onClick={() => setSelectedOption('use_funnder')}
          className={`p-4 rounded-xl border-2 text-left hover:bg-gray-100 transition-colors duration-200 ${
            selectedOption === 'use_funnder' 
              ? 'border-brand-teal-100 bg-white' 
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="font-semibold text-gray-900">Use Funnder Number</div>
          <div className="text-sm text-gray-600">Share the agent's number as your new business line.</div>
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone System Type</label>
          <select 
            value={phoneSystemType}
            onChange={(e) => setPhoneSystemType(e.target.value as any)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
          >
            <option value="mobile">Mobile</option>
            <option value="voip">VoIP</option>
            <option value="pstn">PSTN</option>
            <option value="landline">Landline</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Select Your Provider</label>
          <select 
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
          >
            <option value="verizon">Verizon</option>
            <option value="at&t">AT&T</option>
            <option value="t-mobile">T-Mobile</option>
            <option value="sprint">Sprint</option>
            <option value="ringcentral">RingCentral</option>
            <option value="vonage">Vonage</option>
            <option value="8x8">8x8</option>
          </select>
        </div>
      </div>
      
      {selectedOption === 'forward' && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Your Phone Number</label>
            <input
              type="tel"
              value={userPhoneNumber}
              onChange={(e) => setUserPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
            />
          </div>
          
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 text-center text-sm text-purple-700">
            Ready to configure call forwarding?
            <button 
              onClick={handleConfigureForwarding}
              disabled={isLoading || !userPhoneNumber}
              className="mt-3 block mx-auto bg-brand-teal-100 text-white px-5 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Configuring...
                </div>
              ) : (
                'Configure Call Forwarding'
              )}
            </button>
          </div>
        </div>
      )}

      {selectedOption === 'use_funnder' && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-6 text-center text-sm text-green-700">
          <div className="font-semibold mb-2">Your Funnder Number:</div>
          <div className="text-lg font-bold text-green-800 mb-2">
            {phoneNumber ? phoneNumber.number : '+1 (651) 661-3101'}
          </div>
          <div>Share this number as your new business line!</div>
        </div>
      )}
    </div>
  )
}
