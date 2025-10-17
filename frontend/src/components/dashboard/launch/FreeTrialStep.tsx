'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { getBillingInfo, addPaymentMethod } from '@/lib/dashboard-api'

interface FreeTrialStepProps {
  sessionId?: string
}

export function FreeTrialStep({ sessionId }: FreeTrialStepProps) {
  const [billingInfo, setBillingInfo] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadBillingInfo()
    }
  }, [sessionId, loadBillingInfo])

  const loadBillingInfo = useCallback(async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      const billing = await getBillingInfo(sessionId)
      setBillingInfo(billing)
    } catch (err) {
      console.error('Failed to load billing info:', err)
      setError('Failed to load billing information')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const handleAddPaymentMethod = async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      const result = await addPaymentMethod(sessionId)
      if (result.success) {
        setBillingInfo(result.billing)
        alert('Payment method added successfully! Your trial is now active.')
      } else {
        setError('Failed to add payment method')
      }
    } catch (err) {
      console.error('Failed to add payment method:', err)
      setError('Failed to add payment method')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !billingInfo) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-teal-100" />
          <span className="ml-2 text-gray-600">Loading billing information...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-brand-teal-100 text-white flex items-center justify-center text-sm font-semibold">
          2
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Activate 25 Minute Free Trial</h3>
      </div>
      
      {billingInfo && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-800">
              <strong>Free Trial Active:</strong> {billingInfo.remainingMinutes} minutes remaining
            </div>
            <div className="text-xs text-green-600">
              Trial ends: {new Date(billingInfo.trialEndDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="text-sm text-gray-700 mb-2">Add your Credit Card</div>
          <p className="text-sm text-gray-600">
            Start trial to allow external calls by adding a credit card. You won&apos;t be 
            charged until trial is complete.
          </p>
        </div>
        <div className="flex md:justify-end">
          <button 
            onClick={handleAddPaymentMethod}
            disabled={isLoading || (billingInfo && billingInfo.hasPaymentMethod)}
            className="bg-brand-teal-100 text-white px-5 py-3 rounded-xl hover:bg-brand-teal-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </div>
            ) : billingInfo && billingInfo.hasPaymentMethod ? (
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Added
              </div>
            ) : (
              'Add Credit Card'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
