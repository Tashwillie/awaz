"use client"

import { Logo } from '@/components/ui/Logo'
import { useAuthSession } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { StepNavigation } from '@/components/dashboard/StepNavigation'
import { TrainingStep } from '@/components/dashboard/TrainingStep'
import { CustomizeStep } from '@/components/dashboard/customize/CustomizeStep'
import { LaunchStep } from '@/components/dashboard/launch/LaunchStep'
import { useDashboardState } from '@/hooks/useDashboardState'

const STEPS = [
  { id: 1, label: 'Train' },
  { id: 2, label: 'Customize' },
  { id: 3, label: 'Launch' },
]

export default function DashboardPage() {
  const { data: session, status } = useAuthSession()
  const {
    currentStep,
    setCurrentStep,
    customizeState,
    updateCustomizeState,
    launchStatus,
    handleOpenTrainingFlow,
  } = useDashboardState()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking authentication…</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/demo'
    }
    return null
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <TrainingStep onOpenTrainingFlow={handleOpenTrainingFlow} />
      
      case 2:
        return (
          <CustomizeStep
            state={customizeState}
            onUpdateState={updateCustomizeState}
            onBack={handleBack}
            onContinue={handleContinue}
          />
        )
      
      case 3:
        return (
          <LaunchStep
            status={launchStatus}
            onBack={handleBack}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <Logo />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="w-full px-6 py-8 grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main */}
          <main className="col-span-12 md:col-span-9">
            {/* Steps header */}
            <StepNavigation
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />

            {/* Current step content */}
            {renderCurrentStep()}
          </main>
        </div>
      </div>
    </div>
  )
}