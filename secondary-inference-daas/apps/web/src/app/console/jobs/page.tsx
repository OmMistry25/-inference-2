'use client'

export default function JobsPage() {
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
          <h3 className="text-lg font-medium text-gray-900">All Jobs</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">⚙️</div>
            <p>No jobs found</p>
            <p className="text-sm">Jobs will appear here when you start processing sources</p>
          </div>
        </div>
      </div>
    </div>
  )
}
