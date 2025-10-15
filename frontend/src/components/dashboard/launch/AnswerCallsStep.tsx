export function AnswerCallsStep() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-brand-teal-100 text-white flex items-center justify-center text-sm font-semibold">
          3
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Have Funnder Start Answering Your Calls</h3>
      </div>
      
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm p-3 mb-5">
        Funnder will not answer calls from external numbers until you've started your free trial. 
        If external callers attempt to reach your agent, they will hear an automated message 
        indicating they can't be connected. Start free trial by completing setup and adding a credit card.
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <button className="p-4 rounded-xl border-2 border-brand-teal-100 bg-white text-left hover:bg-gray-50 transition-colors duration-200">
          <div className="font-semibold text-gray-900">Forward Calls</div>
          <div className="text-sm text-gray-600">Send calls from your existing number to Funnder.</div>
        </button>
        <button className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-left hover:bg-gray-100 transition-colors duration-200">
          <div className="font-semibold text-gray-900">Use Funnder Number</div>
          <div className="text-sm text-gray-600">Share the agent's number as your new business line.</div>
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone System Type</label>
          <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent">
            <option>Select Type</option>
            <option>Carrier</option>
            <option>PBX</option>
            <option>VoIP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Select Your Provider</label>
          <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal-100 focus:border-transparent">
            <option>Select Provider</option>
            <option>Twilio</option>
            <option>RingCentral</option>
            <option>Zoom Phone</option>
            <option>Vonage</option>
          </select>
        </div>
      </div>
      
      <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-6 text-center text-sm text-purple-700">
        Select your phone system type & provider
      </div>
    </div>
  )
}
