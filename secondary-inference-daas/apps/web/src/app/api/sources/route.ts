import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get projects the user has access to
    const { data: userProjects, error: projectsError } = await supabase
      .from('core.projects')
      .select(`
        id,
        name,
        org_id,
        core.organizations!inner(
          id,
          name,
          owner_id
        )
      `)
      .eq('core.organizations.owner_id', user.id)

    if (projectsError) {
      console.error('Error fetching user projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch user projects' }, { status: 500 })
    }

    if (!userProjects || userProjects.length === 0) {
      return NextResponse.json({ sources: [] })
    }

    const projectIds = userProjects.map(p => p.id)

    // Fetch sources for those projects
    const { data: sources, error } = await supabase
      .from('ingest.sources')
      .select(`
        id,
        name,
        kind,
        schema_version,
        status,
        metadata,
        created_at,
        updated_at,
        project_id
      `)
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sources:', error)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    // Combine sources with project information
    const sourcesWithProjects = sources?.map(source => {
      const project = userProjects.find(p => p.id === source.project_id)
      return {
        ...source,
        project: project ? {
          id: project.id,
          name: project.name,
          org_id: project.org_id,
          organization: project.core.organizations
        } : null
      }
    }) || []

    return NextResponse.json({ sources: sourcesWithProjects })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
