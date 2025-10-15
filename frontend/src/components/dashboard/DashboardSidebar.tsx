import { ReactNode } from 'react'

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface DashboardSidebarProps {
  businessName?: string
  businessInitial?: string
  navigationItems?: NavigationItem[]
}

export function DashboardSidebar({ 
  businessName = "Evergreens the Fresh Market @ Kempton",
  businessInitial = "F",
  navigationItems = [
    { label: 'Quick Start Guide', href: '#', isActive: true },
    { label: 'Calls', href: '#' },
    { label: 'Agent Settings', href: '#' },
    { label: 'Integrations', href: '#' },
    { label: 'Account', href: '#' },
  ]
}: DashboardSidebarProps) {
  return (
    <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl border border-gray-200 p-4">
      {/* Business Info */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-brand-teal-100 text-white flex items-center justify-center">
          {businessInitial}
        </div>
        <div className="text-sm font-semibold text-gray-900 truncate">
          {businessName}
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`block px-4 py-3 rounded-xl transition-colors duration-200 ${
              item.isActive
                ? 'bg-gray-50 font-medium text-gray-900'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
