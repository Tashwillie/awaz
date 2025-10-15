interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <div className={`${sizeClasses[size]} bg-brand-teal-100 rounded-lg flex items-center justify-center`}>
        <svg
          className="w-3/4 h-3/4 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={`text-brand-blue-600 font-bold ${
        size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
      }`}>
        funnder
      </span>
    </div>
  )
}
