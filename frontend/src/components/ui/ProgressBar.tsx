interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className={`progress-bar ${className || ''}`}>
      <div 
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
