import { LaunchStatus } from '@/types/dashboard'

interface LaunchHeaderProps {
  status: LaunchStatus
}

export function LaunchHeader({ status }: LaunchHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">FREE MINUTES REMAINING</div>
          <div className="text-3xl font-bold text-gray-900">25:00</div>
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
