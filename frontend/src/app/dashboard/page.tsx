"use client"

import { Logo } from '@/components/ui/Logo'
// import { useAuthSession } from '@/lib/auth' // Removed authentication requirement
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
  const {
    currentStep,
    setCurrentStep,
    customizeState,
    updateCustomizeState,
    sessionId,
    launchStatus,
    handleOpenTrainingFlow,
    // Real API data
    dashboardData,
    callMetrics,
    agentPerformance,
    isLoading,
    error,
    setError,
  } = useDashboardState()

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
        return (
          <TrainingStep 
            onOpenTrainingFlow={handleOpenTrainingFlow}
            dashboardData={dashboardData}
            callMetrics={callMetrics}
            agentPerformance={agentPerformance}
          />
        )
      
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
            sessionId={sessionId || undefined}
          />
        )
      
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-100 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-brand-teal-100 text-white rounded-lg hover:bg-brand-teal-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
          <DashboardSidebar 
            businessName={dashboardData?.business?.name || 'Demo Business'}
            businessInitial={dashboardData?.business?.name?.charAt(0) || 'D'}
          />

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