export function FreeTrialStep() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-brand-teal-100 text-white flex items-center justify-center text-sm font-semibold">
          2
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Activate 25 Minute Free Trial</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="text-sm text-gray-700 mb-2">Add your Credit Card</div>
          <p className="text-sm text-gray-600">
            Start trial to allow external calls by adding a credit card. You won't be 
            charged until trial is complete.
          </p>
        </div>
        <div className="flex md:justify-end">
          <button className="bg-brand-teal-100 text-white px-5 py-3 rounded-xl hover:bg-brand-teal-200 transition-colors duration-200">
            Add Credit Card
          </button>
        </div>
      </div>
    </div>
  )
}
