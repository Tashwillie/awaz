import { CustomizeStepProps } from '@/types/dashboard'

export function BasicInfoStep({ state, onUpdateState }: CustomizeStepProps) {
  const handleSaveAndContinue = () => {
    // Here you would typically validate the form data
    onUpdateState({ currentStep: 2, editingFaqs: state.faqs.length === 0 })
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Customize your agent
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Complete the following steps to help Funnder be accurate and effective for your callers. 
        Don&apos;t worry, you can make changes to these settings later.
      </p>

      {/* Trained on card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="text-xs text-gray-500 mb-2">YOUR AGENT IS TRAINED ON</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-600">Google Business Profile</div>
          <div className="text-gray-900">Evergreens the Fresh Market @ Kempton</div>
          <div className="text-gray-600">Business Website</div>
          <div className="text-gray-900">https://evergreens.co.za/?utm_source=google&utm_medium=local</div>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
          Let&apos;s start by confirming we have your basic business info right.
        </h2>
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-600">Business Name</label>
            <input 
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent" 
              defaultValue="Evergreens the Fresh Market @ Kempton" 
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Business Phone</label>
            <input 
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent" 
              placeholder="(000) 000-0000" 
            />
            <p className="text-xs text-red-500 mt-1">Business primary phone number is required</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Business Overview</label>
            <textarea 
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent" 
              rows={6} 
              defaultValue="We operate a nationwide network of branches..." 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">2/8</div>
            <div className="space-x-3">
              <button 
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200" 
                onClick={onBack}
              >
                Back
              </button>
              <button 
                className="bg-brand-teal-100 text-white px-4 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200" 
                onClick={handleSaveAndContinue}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
