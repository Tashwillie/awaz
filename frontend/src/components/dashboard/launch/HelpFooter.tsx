export function HelpFooter() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="text-gray-700">
        Not sure how to proceed? Our team would be happy to help get you set up!
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200">
          Chat
        </button>
        <button className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200">
          Email
        </button>
      </div>
    </div>
  )
}
