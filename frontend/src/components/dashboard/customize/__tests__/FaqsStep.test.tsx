import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { createMockCustomizeState } from '@/test-utils/test-utils'
import { FaqsStep } from '../FaqsStep'

describe('FaqsStep', () => {
  const mockOnUpdateState = jest.fn()
  const mockOnBack = jest.fn()
  const mockOnContinue = jest.fn()

  const defaultProps = {
    state: createMockCustomizeState({ editingFaqs: true }),
    onUpdateState: mockOnUpdateState,
    onBack: mockOnBack,
    onContinue: mockOnContinue,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the heading', () => {
    render(<FaqsStep {...defaultProps} />)
    
    expect(screen.getByText(/Add FAQs about your business/)).toBeInTheDocument()
  })

  it('shows empty state when no FAQs exist', () => {
    render(<FaqsStep {...defaultProps} />)
    
    expect(screen.getByText(/Add some common questions/)).toBeInTheDocument()
  })

  it('shows add FAQ button', () => {
    render(<FaqsStep {...defaultProps} />)
    
    expect(screen.getByText('+ Add Another Question')).toBeInTheDocument()
  })

  it('adds new FAQ when add button is clicked', () => {
    render(<FaqsStep {...defaultProps} />)
    
    const addButton = screen.getByText('+ Add Another Question')
    fireEvent.click(addButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({
      faqs: [{ id: 'mock-uuid-123', question: '', answer: '' }]
    })
  })

  it('renders existing FAQs in edit mode', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [
        { id: 'faq1', question: 'Test question?', answer: 'Test answer' }
      ],
      editingFaqs: true,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    expect(screen.getByDisplayValue('Test question?')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test answer')).toBeInTheDocument()
    expect(screen.getByText('Question 1')).toBeInTheDocument()
  })

  it('updates FAQ question when input changes', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [{ id: 'faq1', question: 'Old question?', answer: 'Answer' }],
      editingFaqs: true,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    const questionInput = screen.getByDisplayValue('Old question?')
    fireEvent.change(questionInput, { target: { value: 'New question?' } })
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({
      faqs: [{ id: 'faq1', question: 'New question?', answer: 'Answer' }]
    })
  })

  it('updates FAQ answer when textarea changes', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [{ id: 'faq1', question: 'Question?', answer: 'Old answer' }],
      editingFaqs: true,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    const answerTextarea = screen.getByDisplayValue('Old answer')
    fireEvent.change(answerTextarea, { target: { value: 'New answer' } })
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({
      faqs: [{ id: 'faq1', question: 'Question?', answer: 'New answer' }]
    })
  })

  it('deletes FAQ when delete button is clicked', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [
        { id: 'faq1', question: 'Question 1?', answer: 'Answer 1' },
        { id: 'faq2', question: 'Question 2?', answer: 'Answer 2' }
      ],
      editingFaqs: true,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({
      faqs: [{ id: 'faq2', question: 'Question 2?', answer: 'Answer 2' }]
    })
  })

  it('saves changes when save button is clicked', () => {
    render(<FaqsStep {...defaultProps} />)
    
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ editingFaqs: false })
  })

  it('shows review mode when not editing', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [
        { id: 'faq1', question: 'Test question?', answer: 'Test answer' }
      ],
      editingFaqs: false,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    expect(screen.getByText('Q: Test question?')).toBeInTheDocument()
    expect(screen.getByText('A: Test answer')).toBeInTheDocument()
    expect(screen.getByText('Make changes ✎')).toBeInTheDocument()
  })

  it('shows multiple FAQs count in review mode', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [
        { id: 'faq1', question: 'Question 1?', answer: 'Answer 1' },
        { id: 'faq2', question: 'Question 2?', answer: 'Answer 2' },
        { id: 'faq3', question: 'Question 3?', answer: 'Answer 3' }
      ],
      editingFaqs: false,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    expect(screen.getByText('+ 2 more')).toBeInTheDocument()
  })

  it('switches to edit mode when make changes is clicked', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [{ id: 'faq1', question: 'Question?', answer: 'Answer' }],
      editingFaqs: false,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    const makeChangesButton = screen.getByText('Make changes ✎')
    fireEvent.click(makeChangesButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ editingFaqs: true })
  })

  it('continues to next step when continue button is clicked', () => {
    const stateWithFaqs = createMockCustomizeState({
      faqs: [{ id: 'faq1', question: 'Question?', answer: 'Answer' }],
      editingFaqs: false,
    })

    render(<FaqsStep {...defaultProps} state={stateWithFaqs} />)
    
    const continueButton = screen.getByText('Continue →')
    fireEvent.click(continueButton)
    
    expect(mockOnUpdateState).toHaveBeenCalledWith({ 
      currentStep: 3, 
      editingAgent: false 
    })
  })

  it('calls onBack when back button is clicked', () => {
    render(<FaqsStep {...defaultProps} />)
    
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('shows progress indicator', () => {
    render(<FaqsStep {...defaultProps} />)
    
    expect(screen.getByText('3/8')).toBeInTheDocument()
  })
})
