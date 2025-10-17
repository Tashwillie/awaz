import { CustomizeStepProps } from '@/types/dashboard'

export function FaqsStep({ state, onUpdateState, onBack, onContinue }: CustomizeStepProps) {
  const handleAddFaq = () => {
    const newFaq = {
      id: crypto.randomUUID(),
      question: '',
      answer: ''
    }
    onUpdateState({ faqs: [...state.faqs, newFaq] })
  }

  const handleDeleteFaq = (id: string) => {
    onUpdateState({ faqs: state.faqs.filter(faq => faq.id !== id) })
  }

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    onUpdateState({
      faqs: state.faqs.map(faq =>
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    })
  }

  const handleSaveChanges = () => {
    onUpdateState({ editingFaqs: false })
  }

  const handleMakeChanges = () => {
    onUpdateState({ editingFaqs: true })
  }

  const handleContinue = () => {
    onUpdateState({ currentStep: 3, editingAgent: false })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Add FAQs about your business so your agent can answer common questions easily.
      </h2>

      {state.editingFaqs ? (
        <>
          {state.faqs.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600 mb-4">
              Add some common questions to teach your agent about your business. 
              You can add more and update them later.
            </div>
          )}
          
          <div className="space-y-4">
            {state.faqs.map((faq, idx) => (
              <div key={faq.id} className="rounded-xl border border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">Question {idx + 1}</label>
                  <button 
                    className="text-sm text-red-500 hover:text-red-700 transition-colors duration-200" 
                    onClick={() => handleDeleteFaq(faq.id)}
                  >
                    Delete
                  </button>
                </div>
                <input
                  className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
                  placeholder="Type question"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                />
                <label className="text-sm text-gray-600">Answer</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
                  rows={4}
                  placeholder="Type answer"
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <button
              className="w-full py-3 rounded-lg bg-brand-teal-100 text-white hover:bg-brand-teal-200 transition-colors duration-200"
              onClick={handleAddFaq}
            >
              + Add Another Question
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
              onClick={onBack}
            >
              Back
            </button>
            <div className="text-xs text-gray-500">3/8</div>
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
          {/* Review card */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left">
            {state.faqs.slice(0, 1).map(faq => (
              <div key={faq.id} className="space-y-2">
                <div className="font-semibold text-gray-900">Q: {faq.question || '—'}</div>
                <div className="text-gray-700">A: {faq.answer || '—'}</div>
              </div>
            ))}
            {state.faqs.length > 1 && (
              <div className="text-xs text-gray-500 mt-3">+ {state.faqs.length - 1} more</div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
              onClick={onBack}
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">3/8</div>
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
