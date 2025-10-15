import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { createMockCustomizeState } from '@/test-utils/test-utils'
import { AgentSettingsStep } from '../AgentSettingsStep'

describe('AgentSettingsStep', () => {
  const mockOnUpdateState = jest.fn()
  const mockOnBack = jest.fn()
  const mockOnContinue = jest.fn()

  const defaultProps = {
    state: createMockCustomizeState({ editingAgent: true }),
    onUpdateState: mockOnUpdateState,
    onBack: mockOnBack,
    onContinue: mockOnContinue,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the heading', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    expect(screen.getByText(/Want to change your agent's name and background noise/)).toBeInTheDocument()
  })

  it('renders agent name input in edit mode', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    expect(screen.getByLabelText('Agent Name')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Agent')).toBeInTheDocument()
  })

  it('renders background noise select in edit mode', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    expect(screen.getByLabelText('Background Noise')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Office')).toBeInTheDocument()
  })

  it('updates agent name when input changes', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    const nameInput = screen.getByLabelText('Agent Name')
    fireEvent.change(nameInput, { target: { value: 'New Agent Name' } })
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ 
      agentName: 'New Agent Name' 
    })
  })

  it('updates background noise when select changes', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    const noiseSelect = screen.getByLabelText('Background Noise')
    fireEvent.change(noiseSelect, { target: { value: 'Cafe' } })
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ 
      backgroundNoise: 'Cafe' 
    })
  })

  it('has all background noise options', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    const noiseSelect = screen.getByLabelText('Background Noise')
    expect(noiseSelect).toHaveDisplayValue('Office')
    
    const options = Array.from(noiseSelect.querySelectorAll('option')).map(
      option => option.textContent
    )
    expect(options).toEqual(['None', 'Office', 'Cafe', 'Street', 'Home'])
  })

  it('saves changes when save button is clicked', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ editingAgent: false })
  })

  it('shows review mode when not editing', () => {
    const reviewState = createMockCustomizeState({
      editingAgent: false,
      agentName: 'Review Agent',
      backgroundNoise: 'Cafe',
    })

    render(<AgentSettingsStep {...defaultProps} state={reviewState} />)
    
    expect(screen.getByText('Review Agent')).toBeInTheDocument()
    expect(screen.getByText('Cafe')).toBeInTheDocument()
    expect(screen.getByText('Make changes ✎')).toBeInTheDocument()
  })

  it('shows make changes button in review mode', () => {
    const reviewState = createMockCustomizeState({
      editingAgent: false,
    })

    render(<AgentSettingsStep {...defaultProps} state={reviewState} />)
    
    const makeChangesButton = screen.getByText('Make changes ✎')
    expect(makeChangesButton).toBeInTheDocument()
  })

  it('switches to edit mode when make changes is clicked', () => {
    const reviewState = createMockCustomizeState({
      editingAgent: false,
    })

    render(<AgentSettingsStep {...defaultProps} state={reviewState} />)
    
    const makeChangesButton = screen.getByText('Make changes ✎')
    fireEvent.click(makeChangesButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ editingAgent: true })
  })

  it('continues to next step when continue button is clicked', () => {
    const reviewState = createMockCustomizeState({
      editingAgent: false,
    })

    render(<AgentSettingsStep {...defaultProps} state={reviewState} />)
    
    const continueButton = screen.getByText('Continue →')
    fireEvent.click(continueButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ 
      customizeStep: 4, 
      editingGreeting: false 
    })
  })

  it('calls onBack when back button is clicked', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('shows progress indicator', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    expect(screen.getByText('4/8')).toBeInTheDocument()
  })

  it('handles empty agent name in review mode', () => {
    const reviewState = createMockCustomizeState({
      editingAgent: false,
      agentName: '',
      backgroundNoise: '',
    })

    render(<AgentSettingsStep {...defaultProps} state={reviewState} />)
    
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('applies correct styling to inputs', () => {
    render(<AgentSettingsStep {...defaultProps} />)
    
    const nameInput = screen.getByLabelText('Agent Name')
    expect(nameInput).toHaveClass('focus:ring-2', 'focus:ring-brand-teal-100')
    
    const noiseSelect = screen.getByLabelText('Background Noise')
    expect(noiseSelect).toHaveClass('focus:ring-2', 'focus:ring-brand-teal-100')
  })
})
