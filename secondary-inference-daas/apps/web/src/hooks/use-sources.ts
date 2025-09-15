'use client'

import { useState, useEffect } from 'react'

export interface Source {
  id: string
  name: string
  kind: 'tracks' | 'poses' | 'detections' | 'captions'
  schema_version: string
  status: 'active' | 'archived' | 'error'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  project_id: string
  project: {
    id: string
    name: string
    org_id: string
    organization: {
      id: string
      name: string
      owner_id: string
    }
  }
}

export function useSources() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/sources')
        
        if (!response.ok) {
          throw new Error('Failed to fetch sources')
        }
        
        const data = await response.json()
        setSources(data.sources || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching sources:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSources()
  }, [])

  return { sources, loading, error, refetch: () => window.location.reload() }
}
