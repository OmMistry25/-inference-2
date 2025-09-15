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
        organizations!inner(
          id,
          name,
          owner_id
        )
      `)
      .eq('organizations.owner_id', user.id)

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
          organization: project.organizations
        } : null
      }
    }) || []

    return NextResponse.json({ sources: sourcesWithProjects })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { name, kind, schema_version, metadata } = body

    // Validate required fields
    if (!name || !kind || !schema_version) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate kind
    const validKinds = ['tracks', 'poses', 'detections', 'captions']
    if (!validKinds.includes(kind)) {
      return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
    }

    // Get user's first project (for now, we'll use the first available project)
    // In a real app, you'd want to let the user select which project
    const { data: userProjects, error: projectsError } = await supabase
      .from('core.projects')
      .select(`
        id,
        name,
        org_id,
        organizations!inner(
          id,
          name,
          owner_id
        )
      `)
      .eq('organizations.owner_id', user.id)
      .limit(1)

    if (projectsError || !userProjects || userProjects.length === 0) {
      return NextResponse.json({ error: 'No projects found' }, { status: 400 })
    }

    const projectId = userProjects[0].id

    // Create the source
    const { data: newSource, error: createError } = await supabase
      .from('ingest.sources')
      .insert({
        project_id: projectId,
        name,
        kind,
        schema_version,
        status: 'active',
        metadata: metadata || {}
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating source:', createError)
      return NextResponse.json({ error: 'Failed to create source' }, { status: 500 })
    }

    return NextResponse.json({ source: newSource }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/sources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
