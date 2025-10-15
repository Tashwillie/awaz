import { MapPin, Star, Phone, Globe } from 'lucide-react'

export interface Business {
  place_id: string
  name: string
  address: string
  website?: string
  phone?: string
  types: string[]
  rating?: number
  user_ratings_total?: number
}

interface BusinessCardProps {
  business: Business
  isSelected: boolean
  onSelect: (business: Business) => void
}

export function BusinessCard({ business, isSelected, onSelect }: BusinessCardProps) {
  return (
    <div
      className={`business-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(business)}
    >
      <div className="flex items-start space-x-4">
        {/* Business Image Placeholder */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <span className="text-brand-blue-600 font-bold text-sm">
              {business.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Business Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {business.name}
          </h3>
          
          <div className="flex items-center space-x-1 mt-1">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-600 truncate">{business.address}</p>
          </div>

          <div className="flex items-center space-x-4 mt-2">
            {business.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {business.rating} ({business.user_ratings_total || 0})
                </span>
              </div>
            )}

            {business.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{business.phone}</span>
              </div>
            )}

            {business.website && (
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-blue-600 truncate">
                  {business.website.replace('https://', '').replace('http://', '')}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {business.types.slice(0, 3).map((type, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        <div className="flex-shrink-0">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? 'border-brand-teal-100 bg-brand-teal-100' 
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
