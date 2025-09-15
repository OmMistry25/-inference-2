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

    // Fetch sources for projects the user has access to
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
        project_id,
        core.projects!inner(
          id,
          name,
          org_id,
          core.organizations!inner(
            id,
            name,
            owner_id
          )
        )
      `)
      .eq('core.projects.core.organizations.owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sources:', error)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    return NextResponse.json({ sources })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
