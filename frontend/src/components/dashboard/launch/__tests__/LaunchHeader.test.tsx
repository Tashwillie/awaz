import { render, screen } from '@/test-utils/test-utils'
import { createMockLaunchStatus } from '@/test-utils/test-utils'
import { LaunchHeader } from '../LaunchHeader'

describe('LaunchHeader', () => {
  it('renders with default status', () => {
    render(<LaunchHeader status={createMockLaunchStatus()} />)
    
    expect(screen.getByText('FREE MINUTES REMAINING')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('Your agent is ready ✨')).toBeInTheDocument()
  })

  it('displays business name when provided', () => {
    const status = createMockLaunchStatus({ business: 'Test Business' })
    
    render(<LaunchHeader status={status} />)
    
    expect(screen.getByText('Business: Test Business')).toBeInTheDocument()
  })

  it('displays default message when no business name', () => {
    const status = createMockLaunchStatus({ business: undefined })
    
    render(<LaunchHeader status={status} />)
    
    expect(screen.getByText(/1 Test your agent · 2 Start your trial · 3 Funnder answers your live calls/)).toBeInTheDocument()
  })

  it('displays custom minutes remaining', () => {
    const status = createMockLaunchStatus({ minutesLeft: 15 })
    
    render(<LaunchHeader status={status} />)
    
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('applies correct styling to minutes display', () => {
    render(<LaunchHeader status={createMockLaunchStatus()} />)
    
    const minutesDisplay = screen.getByText('25:00')
    expect(minutesDisplay).toHaveClass('text-3xl', 'font-bold', 'text-gray-900')
  })

  it('applies correct styling to status text', () => {
    render(<LaunchHeader status={createMockLaunchStatus()} />)
    
    const statusText = screen.getByText('Your agent is ready ✨')
    expect(statusText).toHaveClass('text-lg', 'font-semibold', 'text-gray-900')
  })

  it('has proper layout structure', () => {
    render(<LaunchHeader status={createMockLaunchStatus()} />)
    
    const container = screen.getByText('FREE MINUTES REMAINING').closest('div')
    expect(container).toHaveClass(
      'bg-white',
      'rounded-2xl',
      'border',
      'border-gray-200',
      'p-6'
    )
  })

  it('displays label with correct styling', () => {
    render(<LaunchHeader status={createMockLaunchStatus()} />)
    
    const label = screen.getByText('FREE MINUTES REMAINING')
    expect(label).toHaveClass('text-xs', 'text-gray-500')
  })
})
