import { CustomizeStepProps } from '@/types/dashboard'

export function CustomQuestionsStep({ state, onUpdateState, onBack, onContinue }: CustomizeStepProps) {
  const handleAddQuestion = () => {
    onUpdateState({ customQuestions: [...state.customQuestions, ''] })
  }

  const handleUpdateQuestion = (index: number, value: string) => {
    const updatedQuestions = state.customQuestions.map((q, i) => 
      i === index ? value : q
    )
    onUpdateState({ customQuestions: updatedQuestions })
  }

  const handleSaveChanges = () => {
    onUpdateState({ editingCustomQs: false })
  }

  const handleMakeChanges = () => {
    onUpdateState({ editingCustomQs: true })
  }

  const handleContinue = () => {
    // Advance to the next top-level step (Launch)
    onContinue()
  }

  const handleBack = () => {
    onUpdateState({ currentStep: 4, editingGreeting: false })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
        When taking a message, would you like to add custom questions to gather more details?
      </h2>

      {state.editingCustomQs ? (
        <>
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-600">Always Collected</div>
              <div className="text-gray-900">
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" checked readOnly className="w-4 h-4" />
                  <span>Caller Name</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked readOnly className="w-4 h-4" />
                  <span>Caller Phone Number</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">Custom Questions</div>
            {state.customQuestions.length === 0 && (
              <p className="text-sm text-gray-500">
                Make messages more valuable by having your agent ask for key info, 
                like customer status or account number.
              </p>
            )}
            
            <div className="space-y-3">
              {state.customQuestions.map((question, i) => (
                <input
                  key={i}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
                  placeholder={`Question ${i + 1}`}
                  value={question}
                  onChange={(e) => handleUpdateQuestion(i, e.target.value)}
                />
              ))}
            </div>
            
            <button
              className="w-full py-3 rounded-lg bg-brand-teal-100 text-white hover:bg-brand-teal-200 transition-colors duration-200"
              onClick={handleAddQuestion}
            >
              Add Question ⊕
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
              onClick={handleBack}
            >
              Back
            </button>
            <div className="text-xs text-gray-500">6/8</div>
            <button 
              className="bg-brand-teal-100 text-white px-4 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200" 
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 max-w-2xl mx-auto text-sm">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-gray-600">Always Collected</div>
              <div className="text-gray-900 text-right">Caller Name, Caller Phone Number</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Custom Questions</div>
              <div className="text-gray-900 text-right">
                {state.customQuestions.length ? state.customQuestions.join(', ') : 'None'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
              onClick={handleBack}
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">6/8</div>
              <button 
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
                onClick={handleMakeChanges}
              >
                Make changes ✎
              </button>
              <button 
                className="bg-brand-teal-100 text-white px-4 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200" 
                onClick={handleContinue}
              >
                Continue →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
