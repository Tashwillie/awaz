export interface Faq {
  id: string
  question: string
  answer: string
}

export interface CustomizeState {
  currentStep: number
  faqs: Faq[]
  editingFaqs: boolean
  agentName: string
  backgroundNoise: string
  editingAgent: boolean
  greeting: string
  includeRecordingDisclaimer: boolean
  editingGreeting: boolean
  customQuestions: string[]
  editingCustomQs: boolean
}

export interface LaunchStatus {
  minutesLeft?: number
  business?: string
}

export interface CustomizeStepProps {
  state: CustomizeState
  onUpdateState: (updates: Partial<CustomizeState>) => void
  onBack: () => void
  onContinue: () => void
}
