'use client'

import Link from 'next/link'

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your vision model output sources
          </p>
        </div>
        <Link
          href="/console/sources/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add New Source
        </Link>
      </div>

      {/* Sources Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Sources</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📁</div>
            <p>No sources found</p>
            <p className="text-sm">Add your first source to get started</p>
            <Link
              href="/console/sources/new"
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Source
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
