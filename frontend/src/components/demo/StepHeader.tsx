import { ArrowLeft } from 'lucide-react'
import { ProgressBar } from '../ui/ProgressBar'

interface StepHeaderProps {
  currentStep: number
  totalSteps: number
  onBack?: () => void
}

export function StepHeader({ currentStep, totalSteps, onBack }: StepHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}
      <div className="flex items-center space-x-3">
        <span className="text-gray-600 font-medium">
          {currentStep}/{totalSteps}
        </span>
        <ProgressBar current={currentStep} total={totalSteps} className="w-24" />
      </div>
    </div>
  )
}
