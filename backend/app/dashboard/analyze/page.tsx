'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          generateSteps: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            🔍 Analyze Repository
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label
                  htmlFor="repoUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the full GitHub URL of the repository to analyze
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? '🔄 Analyzing...' : '🚀 Analyze Repository'}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-6">
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    📊 Analysis Results
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Tech Stack
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Languages:</strong>{' '}
                        {result.analysis.techStack.languages.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Frameworks:</strong>{' '}
                        {result.analysis.techStack.frameworks.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Tools:</strong>{' '}
                        {result.analysis.techStack.tools.join(', ')}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Project Structure
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Type:</strong> {result.analysis.structure.type}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Setup Requirements
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {result.analysis.setupRequirements.environment.join(
                          ', '
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {result.onboardingSteps && result.onboardingSteps.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      📝 Generated Onboarding Steps ({result.onboardingSteps.length})
                    </h2>
                    <div className="space-y-3">
                      {result.onboardingSteps.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-3">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900">
                                {step.title}
                              </h3>
                              {step.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {step.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {step.step_type} • {step.estimated_duration} min
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    ✅ Analysis complete! You can now create an onboarding plan
                    and connect documentation sources.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
