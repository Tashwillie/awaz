import { CustomizeStepProps } from '@/types/dashboard'
import { BasicInfoStep } from './BasicInfoStep'
import { FaqsStep } from './FaqsStep'
import { AgentSettingsStep } from './AgentSettingsStep'
import { GreetingStep } from './GreetingStep'
import { CustomQuestionsStep } from './CustomQuestionsStep'

export function CustomizeStep({ state, onUpdateState, onBack, onContinue }: CustomizeStepProps) {
  const handleUpdateState = (updates: Partial<typeof state>) => {
    onUpdateState(updates)
  }

  const handleBack = () => {
    onUpdateState({ currentStep: 1 })
  }

  const handleContinue = () => {
    // Advance the overall dashboard step (handled by parent)
    onContinue()
  }

  switch (state.currentStep) {
    case 1:
      return (
        <BasicInfoStep
          state={state}
          onUpdateState={handleUpdateState}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )
    
    case 2:
      return (
        <FaqsStep
          state={state}
          onUpdateState={handleUpdateState}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )
    
    case 3:
      return (
        <AgentSettingsStep
          state={state}
          onUpdateState={handleUpdateState}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )
    
    case 4:
      return (
        <GreetingStep
          state={state}
          onUpdateState={handleUpdateState}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )
    
    case 5:
      return (
        <CustomQuestionsStep
          state={state}
          onUpdateState={handleUpdateState}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )
    
    default:
      return null
  }
}
