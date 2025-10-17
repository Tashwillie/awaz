import { useState, useEffect } from 'react'
import { getDemoStatus } from '@/lib/api'
import { 
  getDashboardData, 
  getCallMetrics, 
  getRecentCalls, 
  getAgentPerformance,
  getAgentConfig,
  updateAgentConfig,
  subscribeToUpdates,
  CallMetrics,
  AgentPerformance,
  DashboardData
} from '@/lib/dashboard-api'
import { CustomizeState, LaunchStatus } from '@/types/dashboard'

const INITIAL_CUSTOMIZE_STATE: CustomizeState = {
  currentStep: 1,
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
  const [currentStep, setCurrentStep] = useState<number>(2) // 1: Train, 2: Customize, 3: Launch
  const [customizeState, setCustomizeState] = useState<CustomizeState>(INITIAL_CUSTOMIZE_STATE)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({})
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [callMetrics, setCallMetrics] = useState<CallMetrics | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load session ID from localStorage and fetch dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const sid = localStorage.getItem('funnder_session_id')
        if (sid) {
          setSessionId(sid)
          setIsLoading(true)
          
          // Fetch all dashboard data in parallel
          const [dashboard, metrics, agent, config] = await Promise.all([
            getDashboardData(sid),
            getCallMetrics(sid),
            getAgentPerformance(sid),
            getAgentConfig(sid)
          ])
          
          setDashboardData(dashboard)
          setCallMetrics(metrics)
          setAgentPerformance(agent)
          setCustomizeState(config)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Poll for demo status when in launch step
  useEffect(() => {
    if (!sessionId || currentStep !== 3) return
    
    let mounted = true
    const fetchStatus = async () => {
      try {
        const data = await getDemoStatus(sessionId)
        if (!mounted) return
        const business = data.businessProfile?.business_profile?.brand_voice || 'Unknown Business'
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

  // Authentication check removed - dashboard is now public

  const updateCustomizeState = async (updates: Partial<CustomizeState>) => {
    try {
      if (sessionId) {
        // Update on server
        const updatedConfig = await updateAgentConfig(sessionId, updates)
        setCustomizeState(updatedConfig)
      } else {
        // Update locally if no session
        setCustomizeState(prev => ({ ...prev, ...updates }))
      }
    } catch (error) {
      console.error('Failed to update agent config:', error)
      setError('Failed to update agent configuration')
    }
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
    // Real API data
    dashboardData,
    callMetrics,
    agentPerformance,
    isLoading,
    error,
    setError,
  }
}
