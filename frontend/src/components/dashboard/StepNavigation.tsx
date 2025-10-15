interface Step {
  id: number
  label: string
}

interface StepNavigationProps {
  steps: Step[]
  currentStep: number
  onStepClick: (stepId: number) => void
}

export function StepNavigation({ steps, currentStep, onStepClick }: StepNavigationProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-center space-x-6 text-sm font-medium text-gray-700">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className="flex items-center space-x-2 transition-colors duration-200 hover:text-gray-900"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                currentStep === step.id
                  ? 'bg-brand-blue-600 text-white'
                  : step.id < currentStep
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.id < currentStep ? '✓' : step.id}
            </div>
            <span
              className={`transition-colors duration-200 ${
                currentStep === step.id ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
