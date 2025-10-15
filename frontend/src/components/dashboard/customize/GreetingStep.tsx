import { CustomizeStepProps } from '@/types/dashboard'

export function GreetingStep({ state, onUpdateState, onBack, onContinue }: CustomizeStepProps) {
  const handleSaveChanges = () => {
    onUpdateState({ editingGreeting: false })
  }

  const handleMakeChanges = () => {
    onUpdateState({ editingGreeting: true })
  }

  const handleContinue = () => {
    onUpdateState({ customizeStep: 5, editingCustomQs: false })
  }

  const handleBack = () => {
    onUpdateState({ customizeStep: 3, editingAgent: false })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Make a great first impression with a personalized call greeting.
      </h2>

      {state.editingGreeting ? (
        <>
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Greeting</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
                rows={4}
                value={state.greeting}
                onChange={(e) => onUpdateState({ greeting: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recording-disclaimer"
                checked={state.includeRecordingDisclaimer}
                onChange={(e) => onUpdateState({ includeRecordingDisclaimer: e.target.checked })}
                className="w-4 h-4 text-brand-teal-100 border-gray-300 rounded focus:ring-brand-teal-100"
              />
              <label htmlFor="recording-disclaimer" className="text-sm text-gray-600">
                Recording Disclaimer Included
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Tip: To remove the disclaimer, turn it off and edit the greeting.
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
              onClick={handleBack}
            >
              Back
            </button>
            <div className="text-xs text-gray-500">5/8</div>
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
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Greeting</div>
              <div className="font-medium text-gray-900 text-right whitespace-pre-wrap">
                {state.greeting}
              </div>
              <div className="text-gray-600">Recording Disclaimer Included</div>
              <div className="font-medium text-gray-900 text-right">
                {state.includeRecordingDisclaimer ? 'YES' : 'NO'}
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
              <div className="text-xs text-gray-500">5/8</div>
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
