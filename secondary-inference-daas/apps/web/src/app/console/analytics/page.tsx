'use client'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          View insights and performance metrics
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📈</div>
            <p>No analytics data available</p>
            <p className="text-sm">Analytics will appear here as you process more data</p>
          </div>
        </div>
      </div>
    </div>
  )
}
