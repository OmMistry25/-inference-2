'use client'

export default function DatasetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and download your processed datasets
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Datasets</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📦</div>
            <p>No datasets found</p>
            <p className="text-sm">Datasets will appear here after events are processed and published</p>
          </div>
        </div>
      </div>
    </div>
  )
}
