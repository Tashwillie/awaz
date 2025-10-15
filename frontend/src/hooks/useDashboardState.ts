import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDemoStatus } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { CustomizeState, LaunchStatus } from '@/types/dashboard'

const INITIAL_CUSTOMIZE_STATE: CustomizeState = {
  currentStep: 1,
  customizeStep: 1,
  faqs: [],
  editingFaqs: true,
  agentName: 'Funnder',
  backgroundNoise: 'Office',
  editingAgent: true,
  greeting: 'Hello, thank you for calling. Our call may be recorded today for quality control purposes. My name is Funnder, how can I help you?',
  includeRecordingDisclaimer: true,
  editingGreeting: true,
  customQuestions: [],
  editingCustomQs: true,
}

export function useDashboardState() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(2) // 1: Train, 2: Customize, 3: Launch
  const [customizeState, setCustomizeState] = useState<CustomizeState>(INITIAL_CUSTOMIZE_STATE)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({})

  // Load session ID from localStorage
  useEffect(() => {
    try {
      const sid = localStorage.getItem('funnder_session_id')
      if (sid) setSessionId(sid)
    } catch (error) {
      console.error('Failed to load session ID:', error)
    }
  }, [])

  // Poll for demo status when in launch step
  useEffect(() => {
    if (!sessionId || currentStep !== 3) return
    
    let mounted = true
    const fetchStatus = async () => {
      try {
        const data = await getDemoStatus(sessionId)
        if (!mounted) return
        const business = data.businessProfile?.business_profile?.name
        setLaunchStatus(prev => ({ ...prev, business }))
      } catch (error) {
        console.error('Failed to fetch demo status:', error)
      }
    }
    
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [sessionId, currentStep])

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/demo')
    }
  }, [router])

  const updateCustomizeState = (updates: Partial<CustomizeState>) => {
    setCustomizeState(prev => ({ ...prev, ...updates }))
  }

  const handleOpenTrainingFlow = () => {
    window.location.href = '/demo'
  }

  return {
    currentStep,
    setCurrentStep,
    customizeState,
    updateCustomizeState,
    sessionId,
    launchStatus,
    handleOpenTrainingFlow,
  }
}
