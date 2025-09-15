'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NewSourceForm {
  name: string
  kind: 'tracks' | 'poses' | 'detections' | 'captions'
  schema_version: string
  metadata: string
}

export default function NewSourcePage() {
  const router = useRouter()
  const [form, setForm] = useState<NewSourceForm>({
    name: '',
    kind: 'tracks',
    schema_version: '1.0',
    metadata: '{}'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Parse metadata JSON
      let parsedMetadata
      try {
        parsedMetadata = JSON.parse(form.metadata)
      } catch (err) {
        throw new Error('Invalid JSON in metadata field')
      }

      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          kind: form.kind,
          schema_version: form.schema_version,
          metadata: parsedMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create source')
      }

      // Redirect to sources list
      router.push('/console/sources')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof NewSourceForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Source</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a new vision model output source
          </p>
        </div>
        <Link
          href="/console/sources"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Back to Sources
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Source Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Store Camera 1 - Tracks"
            />
          </div>

          <div>
            <label htmlFor="kind" className="block text-sm font-medium text-gray-700">
              Source Kind
            </label>
            <select
              id="kind"
              value={form.kind}
              onChange={(e) => handleInputChange('kind', e.target.value as NewSourceForm['kind'])}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="tracks">Tracks</option>
              <option value="poses">Poses</option>
              <option value="detections">Detections</option>
              <option value="captions">Captions</option>
            </select>
          </div>

          <div>
            <label htmlFor="schema_version" className="block text-sm font-medium text-gray-700">
              Schema Version
            </label>
            <input
              type="text"
              id="schema_version"
              required
              value={form.schema_version}
              onChange={(e) => handleInputChange('schema_version', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="1.0"
            />
          </div>

          <div>
            <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
              Metadata (JSON)
            </label>
            <textarea
              id="metadata"
              rows={4}
              value={form.metadata}
              onChange={(e) => handleInputChange('metadata', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder='{"camera_id": "cam_001", "location": "entrance"}'
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter valid JSON metadata for this source
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/console/sources"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
