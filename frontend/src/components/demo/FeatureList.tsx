import { ReactNode } from 'react'

interface FeatureItemProps {
  icon: ReactNode
  text: string
}

interface FeatureListProps {
  features: FeatureItemProps[]
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-start space-x-4 py-3">
      <div className="text-brand-teal-100 mt-1 flex-shrink-0">
        {icon}
      </div>
      <span className="text-gray-900 text-lg leading-relaxed">{text}</span>
    </div>
  )
}

export function FeatureList({ features }: FeatureListProps) {
  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <FeatureItem key={index} {...feature} />
      ))}
    </div>
  )
}
