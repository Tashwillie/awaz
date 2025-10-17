import { LaunchStatus } from '@/types/dashboard'

'use client'

import { useState, useEffect } from 'react'
import { getBillingInfo } from '@/lib/dashboard-api'

interface LaunchHeaderProps {
  status: LaunchStatus
  sessionId?: string
}

export function LaunchHeader({ status, sessionId }: LaunchHeaderProps) {
  const [billingInfo, setBillingInfo] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      loadBillingInfo()
    }
  }, [sessionId])

  const loadBillingInfo = async () => {
    if (!sessionId) return
    
    try {
      const billing = await getBillingInfo(sessionId)
      setBillingInfo(billing)
    } catch (err) {
      console.error('Failed to load billing info:', err)
    }
  }

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">FREE MINUTES REMAINING</div>
          <div className="text-3xl font-bold text-gray-900">
            {billingInfo ? formatTimeRemaining(billingInfo.remainingMinutes) : '25:00'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">Your agent is ready ✨</div>
          <div className="text-xs text-gray-600">
            {status.business 
              ? `Business: ${status.business}` 
              : '1 Test your agent · 2 Start your trial · 3 Funnder answers your live calls'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
