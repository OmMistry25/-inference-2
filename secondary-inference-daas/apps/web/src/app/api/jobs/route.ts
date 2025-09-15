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

    // Get user's jobs using RPC function
    const { data: jobs, error } = await supabase
      .rpc('get_user_jobs', { user_id: user.id })

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    return NextResponse.json({ jobs: jobs || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/jobs:', error)
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
    const { source_id, job_type, input_path, config } = body

    // Validate required fields
    if (!source_id || !job_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate job_type
    const validJobTypes = ['normalize', 'extract_features', 'score_events', 'generate_dataset']
    if (!validJobTypes.includes(job_type)) {
      return NextResponse.json({ error: 'Invalid job type' }, { status: 400 })
    }

    // Get user's first project (for now, we'll use the first available project)
    const { data: userProjects, error: projectsError } = await supabase
      .rpc('get_user_projects', { user_id: user.id })

    if (projectsError || !userProjects || userProjects.length === 0) {
      return NextResponse.json({ error: 'No projects found' }, { status: 400 })
    }

    const projectId = userProjects[0].id

    // Create the job
    const { data: newJob, error: createError } = await supabase
      .from('ingest.jobs')
      .insert({
        project_id: projectId,
        source_id,
        job_type,
        input_path: input_path || null,
        output_path: null,
        status: 'queued',
        config: config || {}
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating job:', createError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    return NextResponse.json({ job: newJob }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
