import { LaunchStatus } from '@/types/dashboard'
import { LaunchHeader } from './LaunchHeader'
import { TestAgentStep } from './TestAgentStep'
import { FreeTrialStep } from './FreeTrialStep'
import { AnswerCallsStep } from './AnswerCallsStep'
import { HelpFooter } from './HelpFooter'

interface LaunchStepProps {
  status: LaunchStatus
  onBack: () => void
}

export function LaunchStep({ status, onBack }: LaunchStepProps) {
  return (
    <div className="space-y-6">
      <LaunchHeader status={status} />
      <TestAgentStep />
      <FreeTrialStep />
      <AnswerCallsStep />
      <HelpFooter />
      
      {/* Bottom navigation */}
      <div className="flex items-center justify-between">
        <button 
          className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
          onClick={onBack}
        >
          Back
        </button>
        <div />
      </div>
    </div>
  )
}
