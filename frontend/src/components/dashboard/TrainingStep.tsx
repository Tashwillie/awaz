import { CallMetrics, AgentPerformance, DashboardData } from '@/lib/dashboard-api'
import { MetricsDashboard } from './MetricsDashboard'
import { RecentCallsList } from './RecentCallsList'

interface TrainingStepProps {
  onOpenTrainingFlow: () => void
  dashboardData?: DashboardData | null
  callMetrics?: CallMetrics | null
  agentPerformance?: AgentPerformance | null
}

export function TrainingStep({ 
  onOpenTrainingFlow, 
  dashboardData, 
  callMetrics, 
  agentPerformance 
}: TrainingStepProps) {
  if (callMetrics && agentPerformance && dashboardData) {
    return (
      <div className="space-y-6">
        {/* Overview Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600 mt-1">Monitor your AI agent&apos;s performance and activity</p>
            </div>
            <button
              onClick={onOpenTrainingFlow}
              className="bg-brand-teal-100 text-white px-4 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200"
            >
              Retrain Agent
            </button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <MetricsDashboard metrics={callMetrics} agent={agentPerformance} />

        {/* Recent Calls */}
        {dashboardData.recentCalls && dashboardData.recentCalls.length > 0 && (
          <RecentCallsList calls={dashboardData.recentCalls} />
        )}
      </div>
    )
  }

  // Fallback for when no data is available
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Training</h2>
      <p className="mb-6">
        Use the multi‑step training flow to search your Google Business Profile, 
        build the agent profile, and verify the call. This is the same 4‑step 
        experience you used on the /demo page.
      </p>
      <button
        onClick={onOpenTrainingFlow}
        className="bg-brand-teal-100 text-white px-5 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200"
      >
        Open Training Flow
      </button>
    </div>
  )
}
