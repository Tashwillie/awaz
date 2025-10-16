'use client'

import { useState, useEffect } from 'react'

interface AnimatedProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
  animated?: boolean
}

export function AnimatedProgressBar({ 
  progress, 
  className = '', 
  showPercentage = false,
  animated = true 
}: AnimatedProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (animated) {
      const duration = 1000 // 1 second animation
      const startTime = Date.now()
      const startProgress = displayProgress

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progressRatio = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3)
        const currentProgress = startProgress + (progress - startProgress) * easeOutCubic
        
        setDisplayProgress(currentProgress)

        if (progressRatio < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    } else {
      setDisplayProgress(progress)
    }
  }, [progress, animated, displayProgress])

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand-teal-100 to-brand-teal-200 rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${displayProgress}%` }}
        >
          {/* Animated shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          )}
          
          {/* Glowing effect */}
          {animated && displayProgress > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-ping" />
          )}
        </div>
      </div>
      
      {showPercentage && (
        <div className="text-right text-sm text-gray-600 mt-1">
          {Math.round(displayProgress)}%
        </div>
      )}
    </div>
  )
}
