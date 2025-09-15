'use client'

import { useJobs } from '@/hooks/use-jobs'

export default function JobsPage() {
  const { jobs, loading, error } = useJobs()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'queued': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'normalize': return '🔄'
      case 'extract_features': return '⚙️'
      case 'score_events': return '🎯'
      case 'generate_dataset': return '📊'
      default: return '📋'
    }
  }

  const formatDuration = (startedAt: string | null, completedAt: string | null) => {
    if (!startedAt) return '-'
    const start = new Date(startedAt)
    const end = completedAt ? new Date(completedAt) : new Date()
    const duration = Math.round((end.getTime() - start.getTime()) / 1000)
    
    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.round(duration / 60)}m`
    return `${Math.round(duration / 3600)}h`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage processing jobs
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-lg">Loading jobs...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage processing jobs
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error loading jobs</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and manage processing jobs
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            All Jobs ({jobs.length})
          </h3>
        </div>

        {jobs.length === 0 ? (
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">⚙️</div>
              <p>No jobs found</p>
              <p className="text-sm">Jobs will appear here when you start processing sources</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getJobTypeIcon(job.job_type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.job_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.source.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.source.kind} v{job.source.schema_version}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {job.error_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(job.started_at, job.completed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        View
                      </button>
                      {job.status === 'queued' && (
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      )}
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
