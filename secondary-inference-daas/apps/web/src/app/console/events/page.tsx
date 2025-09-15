'use client'

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage detected secondary events
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Events</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p>No events found</p>
            <p className="text-sm">Events will appear here after processing jobs complete</p>
          </div>
        </div>
      </div>
    </div>
  )
}
