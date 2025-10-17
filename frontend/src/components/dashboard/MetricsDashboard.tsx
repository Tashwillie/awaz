'use client'

import { CallMetrics, AgentPerformance } from '@/lib/dashboard-api'
import { Phone, Clock, CheckCircle, TrendingUp, Star, Activity } from 'lucide-react'

interface MetricsDashboardProps {
  metrics: CallMetrics
  agent: AgentPerformance
}

export function MetricsDashboard({ metrics, agent }: MetricsDashboardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatPercentage = (value: number) => `${value}%`

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Agent Status</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            agent.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : agent.status === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{agent.totalCallsHandled}</div>
            <div className="text-sm text-gray-600">Calls Handled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              {agent.averageRating}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatPercentage(agent.uptime)}</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>

      {/* Call Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalCalls}</div>
              <div className="text-sm text-gray-600">Total Calls</div>
            </div>
            <Phone className="w-8 h-8 text-brand-teal-100" />
          </div>
        </div>

        {/* Answered Calls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{metrics.answeredCalls}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Average Duration */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatDuration(metrics.averageCallDuration)}</div>
              <div className="text-sm text-gray-600">Avg Duration</div>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(metrics.callSuccessRate)}</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Time-based Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{metrics.todayCalls}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
            <Activity className="w-6 h-6 text-brand-teal-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{metrics.weeklyCalls}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{metrics.monthlyCalls}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
            <Activity className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
