import { render, screen } from '@/test-utils/test-utils'
import { DashboardSidebar } from '../DashboardSidebar'

describe('DashboardSidebar', () => {
  const defaultProps = {
    businessName: 'Test Business',
    businessInitial: 'T',
  }

  it('renders with default props', () => {
    render(<DashboardSidebar {...defaultProps} />)
    
    expect(screen.getByText('Test Business')).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument()
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument()
  })

  it('renders with custom business name and initial', () => {
    render(
      <DashboardSidebar 
        businessName="Custom Business Name" 
        businessInitial="C" 
      />
    )
    
    expect(screen.getByText('Custom Business Name')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('renders default navigation items', () => {
    render(<DashboardSidebar {...defaultProps} />)
    
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument()
    expect(screen.getByText('Calls')).toBeInTheDocument()
    expect(screen.getByText('Agent Settings')).toBeInTheDocument()
    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  it('renders custom navigation items', () => {
    const customNavItems = [
      { label: 'Custom Item 1', href: '/custom1', isActive: true },
      { label: 'Custom Item 2', href: '/custom2' },
    ]

    render(
      <DashboardSidebar 
        {...defaultProps} 
        navigationItems={customNavItems} 
      />
    )
    
    expect(screen.getByText('Custom Item 1')).toBeInTheDocument()
    expect(screen.getByText('Custom Item 2')).toBeInTheDocument()
    expect(screen.queryByText('Quick Start Guide')).not.toBeInTheDocument()
  })

  it('applies active styling to active navigation item', () => {
    const customNavItems = [
      { label: 'Active Item', href: '/active', isActive: true },
      { label: 'Inactive Item', href: '/inactive' },
    ]

    render(
      <DashboardSidebar 
        {...defaultProps} 
        navigationItems={customNavItems} 
      />
    )
    
    const activeItem = screen.getByText('Active Item').closest('a')
    const inactiveItem = screen.getByText('Inactive Item').closest('a')
    
    expect(activeItem).toHaveClass('bg-gray-50', 'font-medium', 'text-gray-900')
    expect(inactiveItem).toHaveClass('text-gray-700')
  })

  it('has correct href attributes for navigation items', () => {
    const customNavItems = [
      { label: 'Test Link', href: '/test-link' },
    ]

    render(
      <DashboardSidebar 
        {...defaultProps} 
        navigationItems={customNavItems} 
      />
    )
    
    const link = screen.getByText('Test Link').closest('a')
    expect(link).toHaveAttribute('href', '/test-link')
  })

  it('truncates long business names', () => {
    const longBusinessName = 'This is a very long business name that should be truncated to prevent layout issues'
    
    render(
      <DashboardSidebar 
        businessName={longBusinessName}
        businessInitial="L"
      />
    )
    
    const businessNameElement = screen.getByText(longBusinessName)
    expect(businessNameElement).toHaveClass('truncate')
  })

  it('renders business initial in styled container', () => {
    render(<DashboardSidebar {...defaultProps} />)
    
    const initialContainer = screen.getByText('T').parentElement
    expect(initialContainer).toHaveClass(
      'w-8', 'h-8', 'rounded-lg', 'bg-brand-teal-100', 
      'text-white', 'flex', 'items-center', 'justify-center'
    )
  })
})
