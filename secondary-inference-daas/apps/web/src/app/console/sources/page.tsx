'use client'

import Link from 'next/link'
import { useSources } from '@/hooks/use-sources'

export default function SourcesPage() {
  const { sources, loading, error } = useSources()

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'tracks': return '🛤️'
      case 'poses': return '🧍'
      case 'detections': return '📦'
      case 'captions': return '📝'
      default: return '📁'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your vision model output sources
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg">Loading sources...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your vision model output sources
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-red-500 py-8">
            <div className="text-lg">Error loading sources: {error}</div>
          </div>
        </div>
      </div>
    )
  }

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
          <h3 className="text-lg font-medium text-gray-900">
            All Sources ({sources.length})
          </h3>
        </div>
        
        {sources.length === 0 ? (
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
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kind
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getKindIcon(source.kind)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {source.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            v{source.schema_version}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {source.kind}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {source.project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {source.project.organization.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                        {source.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(source.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
