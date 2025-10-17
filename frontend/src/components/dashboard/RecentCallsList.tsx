'use client'

import { Call } from '@/types/demo'
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react'

interface RecentCallsListProps {
  calls: Call[]
}

export function RecentCallsList({ calls }: RecentCallsListProps) {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'missed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'missed':
        return 'text-red-600 bg-red-50'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const maskPhoneNumber = (phone: string) => {
    // Show last 4 digits only for privacy
    if (phone.length > 4) {
      return `***-***-${phone.slice(-4)}`
    }
    return phone
  }

  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
          <p className="text-gray-600">Your agent hasn't received any calls yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Calls</h3>
        <p className="text-sm text-gray-600 mt-1">Latest calls handled by your agent</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {calls.map((call) => (
          <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(call.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {call.phoneNumber ? maskPhoneNumber(call.phoneNumber) : &apos;N/A&apos;}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {call.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTimestamp(call.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDuration(call.duration)}
                  </div>
                  <div className="text-xs text-gray-600">duration</div>
                </div>
                
                {call.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {call.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {call.summary && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Summary:</span> {call.summary}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {calls.length >= 10 && (
        <div className="p-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-brand-teal-100 hover:text-brand-teal-200 font-medium">
            View all calls
          </button>
        </div>
      )}
    </div>
  )
}
