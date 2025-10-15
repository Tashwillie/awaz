export function TestAgentStep() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-teal-100 text-white flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Test Your Agent</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
          TEST MODE
        </span>
      </div>
      
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm p-3 mb-4">
        During test mode, your agent can only receive calls from designated testing numbers. 
        No external callers will be able to reach your agent. Calls from test numbers won't 
        count against your minutes.
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Allow test calls from:</div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              We'll automatically capture your phone number when you make your first test call. 
              Give it a try!
            </div>
            <button className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 transition-colors duration-200">
              Manage
            </button>
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-2">Your Funnder Number</div>
              <button className="w-full bg-brand-teal-100 text-white py-2 rounded-lg mb-1 hover:bg-brand-teal-200 transition-colors duration-200">
                Call
              </button>
              <div className="text-center font-semibold text-gray-900">(651) 661-3101</div>
              <div className="text-center text-xs text-gray-500 mt-1 underline hover:text-gray-700 cursor-pointer">
                Request local area code
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">Try asking...</div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>Tell me about your services?</li>
                <li>What services do you offer?</li>
                <li>Are you open tomorrow?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
