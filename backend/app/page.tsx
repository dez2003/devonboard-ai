export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <main className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900">
          Devonboard AI 🚀
        </h1>
        <p className="text-xl text-gray-700">
          Get new developers coding in hours, not weeks.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to the Backend API
          </h2>
          <p className="text-gray-600 mb-6">
            The Devonboard AI backend is up and running. Use the API endpoints to manage onboarding plans.
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Next.js 14 configured</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">TypeScript enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Supabase client ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">API routes configured</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>API Health Check:</strong>{' '}
              <a
                href="/api/health"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                /api/health
              </a>
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-8">
          Stage 1: Backend Foundation ✅
        </div>
      </main>
    </div>
  );
}
