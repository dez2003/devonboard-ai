'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChangesPage() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    // For now, show empty state
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Documentation Changes
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading changes...</p>
              </div>
            ) : changes.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No changes yet
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Documentation changes will appear here once you set up
                  auto-sync
                </p>
                <Link
                  href="/dashboard/sources"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Connect Documentation Sources
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {changes.map((change: any, idx: number) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {change.file_path}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {change.change_summary}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Severity: {change.severity}/10</span>
                          <span>
                            {change.auto_applied ? '✅ Auto-applied' : '⏳ Pending review'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(change.detected_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
