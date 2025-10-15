export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Funnder Backend
        </h1>
        <p className="text-gray-600 mb-6">
          API endpoints are available under <code className="bg-gray-100 px-2 py-1 rounded">/api/*</code>
        </p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Health:</span>
            <a href="/api/health" className="text-blue-600 hover:underline">
              GET /api/health
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Places:</span>
            <a href="/api/places/search?q=plumber" className="text-blue-600 hover:underline">
              GET /api/places/search
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}







