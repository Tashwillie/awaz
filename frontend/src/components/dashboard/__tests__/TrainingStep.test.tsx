import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { TrainingStep } from '../TrainingStep'

describe('TrainingStep', () => {
  const mockOnOpenTrainingFlow = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders training content', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    expect(screen.getByText('Training')).toBeInTheDocument()
    expect(screen.getByText(/multi‑step training flow/)).toBeInTheDocument()
    expect(screen.getByText(/Google Business Profile/)).toBeInTheDocument()
  })

  it('renders the training description', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const description = screen.getByText(
      'Use the multi‑step training flow to search your Google Business Profile, build the agent profile, and verify the call. This is the same 5‑step experience you used on the /demo page.'
    )
    expect(description).toBeInTheDocument()
  })

  it('renders the open training flow button', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const button = screen.getByText('Open Training Flow')
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
  })

  it('calls onOpenTrainingFlow when button is clicked', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const button = screen.getByText('Open Training Flow')
    fireEvent.click(button)
    
    expect(mockOnOpenTrainingFlow).toHaveBeenCalledTimes(1)
  })

  it('applies correct styling to the button', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const button = screen.getByText('Open Training Flow')
    expect(button).toHaveClass(
      'bg-brand-teal-100',
      'text-white',
      'px-5',
      'py-2',
      'rounded-lg'
    )
  })

  it('applies hover effects to the button', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const button = screen.getByText('Open Training Flow')
    expect(button).toHaveClass('hover:bg-brand-teal-200')
  })

  it('has proper heading hierarchy', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Training')
  })

  it('has proper text styling', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const heading = screen.getByText('Training')
    expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-gray-900')
    
    const description = screen.getByText(/multi‑step training flow/)
    expect(description).toHaveClass('text-gray-700')
  })

  it('renders in a card container', () => {
    render(<TrainingStep onOpenTrainingFlow={mockOnOpenTrainingFlow} />)
    
    const container = screen.getByText('Training').closest('div')
    expect(container).toHaveClass(
      'bg-white',
      'rounded-2xl',
      'border',
      'border-gray-200',
      'p-8',
      'text-center'
    )
  })
})
