'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Trophy, Speaker, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar'

interface TrainingStep {
  id: string
  label: string
  completed: boolean
  inProgress: boolean
}

interface AnimatedTrainingFlowProps {
  onComplete: () => void
  businessName?: string
  websiteUrl?: string
}

export function AnimatedTrainingFlow({ onComplete, businessName, websiteUrl }: AnimatedTrainingFlowProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isTraining, setIsTraining] = useState(true)
  const [trainingSteps, setTrainingSteps] = useState<TrainingStep[]>([
    { id: 'analyze', label: 'Analyzing your website for data.', completed: false, inProgress: false },
    { id: 'process', label: 'Processing your business information.', completed: false, inProgress: false },
    { id: 'optimize', label: 'Optimizing your data for AI.', completed: false, inProgress: false },
    { id: 'generate', label: 'Generating your custom Funnder agent.', completed: false, inProgress: false },
  ])

  // Simulate OpenAI training process
  useEffect(() => {
    if (!isTraining) return

    const stepDuration = 3000 // 3 seconds per step
    const progressIncrement = 100 / trainingSteps.length

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + progressIncrement
        if (newProgress >= 100) {
          setIsTraining(false)
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, stepDuration)

    // Update training steps
    const stepInterval = setInterval(() => {
      setTrainingSteps(prev => {
        const newSteps = [...prev]
        const currentIndex = Math.floor((progress / 100) * newSteps.length)
        
        // Mark previous steps as completed
        for (let i = 0; i < currentIndex; i++) {
          newSteps[i].completed = true
          newSteps[i].inProgress = false
        }
        
        // Mark current step as in progress
        if (currentIndex < newSteps.length) {
          newSteps[currentIndex].inProgress = true
          newSteps[currentIndex].completed = false
        }
        
        return newSteps
      })
    }, stepDuration)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [isTraining, progress])

  const handleStartTraining = async () => {
    setIsTraining(true)
    setProgress(0)
    setTrainingSteps(prev => prev.map(step => ({ ...step, completed: false, inProgress: false })))
    
    // Call OpenAI API for actual training
    try {
      await trainWithOpenAI(businessName, websiteUrl)
    } catch (error) {
      console.error('Training failed:', error)
      // Handle error - maybe show retry option
    }
  }

  const trainWithOpenAI = async (businessName?: string, websiteUrl?: string) => {
    // This would be your actual OpenAI integration
    const response = await fetch('/api/train-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        websiteUrl,
        steps: trainingSteps.map(step => step.id),
      }),
    })

    if (!response.ok) {
      throw new Error('Training failed')
    }

    return response.json()
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left - Building copy */}
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
          Building your <span className="text-brand-teal-100">Funnder Agent</span>
        </h1>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-teal-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-700">Funnder is scanning your website and available data.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-teal-100 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-700">Your custom AI agent is being tailored to your business.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-teal-100 rounded-full flex items-center justify-center">
              <Speaker className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-700">Sample clips are being generated for you.</p>
          </div>
        </div>
      </div>

      {/* Right - Progress */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Funnder is training on your data</h3>
        
        {/* Animated Progress Bar */}
        <AnimatedProgressBar 
          progress={progress} 
          showPercentage={true}
          animated={true}
        />

        {/* Training Steps */}
        <ul className="space-y-4 text-gray-700">
          {trainingSteps.map((step, index) => (
            <li key={step.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : step.inProgress ? (
                  <Loader2 className="w-5 h-5 text-brand-teal-100 animate-spin" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
              </div>
              <span className={step.completed ? 'text-green-600' : step.inProgress ? 'text-brand-teal-100 font-medium' : 'opacity-70'}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!isTraining && progress === 0 && (
            <Button 
              onClick={handleStartTraining}
              className="bg-brand-teal-100 text-white hover:bg-brand-teal-200"
            >
              Start Training
            </Button>
          )}
          
          {isTraining && (
            <Button 
              onClick={() => setIsTraining(false)}
              variant="outline"
              className="border-brand-teal-100 text-brand-teal-100 hover:bg-brand-teal-50"
            >
              Pause Training
            </Button>
          )}
          
          {!isTraining && progress === 100 && (
            <Button 
              onClick={onComplete}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Continue to Preview
            </Button>
          )}
          
        </div>
      </div>
    </div>
  )
}
