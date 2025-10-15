import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { StepNavigation } from '../StepNavigation'

describe('StepNavigation', () => {
  const mockSteps = [
    { id: 1, label: 'Train' },
    { id: 2, label: 'Customize' },
    { id: 3, label: 'Launch' },
  ]

  const defaultProps = {
    steps: mockSteps,
    currentStep: 2,
    onStepClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all steps', () => {
    render(<StepNavigation {...defaultProps} />)
    
    expect(screen.getByText('Train')).toBeInTheDocument()
    expect(screen.getByText('Customize')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })

  it('renders step numbers', () => {
    render(<StepNavigation {...defaultProps} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('highlights current step', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const currentStepButton = screen.getByText('2').closest('button')
    expect(currentStepButton).toHaveClass('bg-brand-blue-600', 'text-white')
  })

  it('shows completed steps with checkmark', () => {
    render(<StepNavigation {...defaultProps} currentStep={3} />)
    
    // Step 1 should show checkmark (completed)
    expect(screen.getByText('✓')).toBeInTheDocument()
    
    // Step 2 should show checkmark (completed)
    const step2Button = screen.getByText('✓').closest('button')
    expect(step2Button).toHaveClass('bg-green-100', 'text-green-600')
  })

  it('shows future steps as disabled', () => {
    render(<StepNavigation {...defaultProps} currentStep={1} />)
    
    // Step 3 should be future step
    const step3Button = screen.getByText('3').closest('button')
    expect(step3Button).toHaveClass('bg-gray-200', 'text-gray-600')
  })

  it('calls onStepClick when step is clicked', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const step1Button = screen.getByText('1').closest('button')
    fireEvent.click(step1Button!)
    
    expect(defaultProps.onStepClick).toHaveBeenCalledWith(1)
  })

  it('applies correct styling to step labels based on current step', () => {
    render(<StepNavigation {...defaultProps} />)
    
    // Current step label should be darker
    const currentStepLabel = screen.getByText('Customize')
    expect(currentStepLabel).toHaveClass('text-gray-900')
    
    // Other step labels should be lighter
    const otherStepLabels = [screen.getByText('Train'), screen.getByText('Launch')]
    otherStepLabels.forEach(label => {
      expect(label).toHaveClass('text-gray-600')
    })
  })

  it('handles empty steps array', () => {
    render(
      <StepNavigation 
        steps={[]} 
        currentStep={1} 
        onStepClick={jest.fn()} 
      />
    )
    
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(screen.queryByText('Train')).not.toBeInTheDocument()
  })

  it('handles single step', () => {
    const singleStep = [{ id: 1, label: 'Single Step' }]
    
    render(
      <StepNavigation 
        steps={singleStep} 
        currentStep={1} 
        onStepClick={jest.fn()} 
      />
    )
    
    expect(screen.getByText('Single Step')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('applies hover effects', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const stepButton = screen.getByText('1').closest('button')
    expect(stepButton).toHaveClass('hover:text-gray-900')
  })

  it('renders with different current steps', () => {
    const { rerender } = render(<StepNavigation {...defaultProps} currentStep={1} />)
    expect(screen.getByText('1').closest('button')).toHaveClass('bg-brand-blue-600')
    
    rerender(<StepNavigation {...defaultProps} currentStep={3} />)
    expect(screen.getByText('3').closest('button')).toHaveClass('bg-brand-blue-600')
  })
})
