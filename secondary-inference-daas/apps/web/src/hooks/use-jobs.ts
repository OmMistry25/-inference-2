'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface Job {
  id: string
  project_id: string
  source_id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  job_type: 'normalize' | 'extract_features' | 'score_events' | 'generate_dataset'
  input_path: string | null
  output_path: string | null
  config: Record<string, unknown>
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  source: {
    id: string
    name: string
    kind: string
    schema_version: string
  }
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

export function useJobs() {
  const { user, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      // Don't fetch if user is not authenticated or auth is still loading
      if (!user || authLoading) {
        setLoading(authLoading)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/jobs')
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please sign in to view jobs')
            return
          }
          throw new Error('Failed to fetch jobs')
        }
        
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user, authLoading])

  return { jobs, loading, error, refetch: () => window.location.reload() }
}
