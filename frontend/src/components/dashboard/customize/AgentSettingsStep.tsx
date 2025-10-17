import { CustomizeStepProps } from '@/types/dashboard'

export function AgentSettingsStep({ state, onUpdateState }: CustomizeStepProps) {
  const handleSaveChanges = () => {
    onUpdateState({ editingAgent: false })
  }

  const handleMakeChanges = () => {
    onUpdateState({ editingAgent: true })
  }

  const handleContinue = () => {
    onUpdateState({ currentStep: 4, editingGreeting: false })
  }

  const handleBack = () => {
    onUpdateState({ currentStep: 2, editingFaqs: false })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Want to change your agent&apos;s name and background noise?
      </h2>

      {state.editingAgent ? (
        <>
          <div className="grid gap-4 max-w-xl mx-auto">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Agent Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
                value={state.agentName}
                onChange={(e) => onUpdateState({ agentName: e.target.value })}
                placeholder="Enter agent name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Background Noise</label>
              <select
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent"
                value={state.backgroundNoise}
                onChange={(e) => onUpdateState({ backgroundNoise: e.target.value })}
              >
                <option value="None">None</option>
                <option value="Office">Office</option>
                <option value="Cafe">Cafe</option>
                <option value="Street">Street</option>
                <option value="Home">Home</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
              onClick={handleBack}
            >
              Back
            </button>
            <div className="text-xs text-gray-500">4/8</div>
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
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 max-w-xl mx-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Agent Name</div>
              <div className="font-medium text-gray-900 text-right">{state.agentName || '—'}</div>
              <div className="text-gray-600">Background Noise</div>
              <div className="font-medium text-gray-900 text-right">{state.backgroundNoise || '—'}</div>
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
              <div className="text-xs text-gray-500">4/8</div>
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
