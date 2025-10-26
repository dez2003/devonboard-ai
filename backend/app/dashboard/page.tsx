import Link from 'next/link';

/**
 * Dashboard Home Page
 * Overview of the Devonboard AI system
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Devonboard AI Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
            <StatCard
              title="Active Plans"
              value="0"
              description="Onboarding plans"
              icon="📋"
            />
            <StatCard
              title="Documentation Sources"
              value="0"
              description="Connected sources"
              icon="📚"
            />
            <StatCard
              title="Recent Changes"
              value="0"
              description="Last 24 hours"
              icon="🔄"
            />
            <StatCard
              title="Active Developers"
              value="0"
              description="Currently onboarding"
              icon="👥"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/dashboard/analyze"
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                🔍 Analyze Repository
              </Link>
              <Link
                href="/dashboard/sources"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                📚 Manage Sources
              </Link>
              <Link
                href="/dashboard/changes"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                📊 View Changes
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              🚀 Getting Started
            </h2>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium mr-3">
                  1
                </span>
                <div>
                  <strong>Analyze a repository</strong> - Start by analyzing a
                  GitHub repository to generate onboarding steps
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium mr-3">
                  2
                </span>
                <div>
                  <strong>Connect documentation sources</strong> - Add Notion,
                  Confluence, or other docs
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium mr-3">
                  3
                </span>
                <div>
                  <strong>Set up auto-sync</strong> - Configure GitHub webhooks
                  for automatic updates
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium mr-3">
                  4
                </span>
                <div>
                  <strong>Install VS Code extension</strong> - Developers use
                  the extension to follow onboarding
                </div>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-3xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
              <dd className="text-xs text-gray-500">{description}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
