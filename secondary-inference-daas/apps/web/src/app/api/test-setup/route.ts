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

    // Call the function to ensure demo data exists for this user
    console.log('Manually setting up demo data for user:', user.id)
    const { error } = await supabase.rpc('ensure_demo_data_for_user', {
      user_id: user.id
    })

    if (error) {
      console.error('Error setting up demo data:', error)
      return NextResponse.json({ error: 'Failed to setup demo data', details: error }, { status: 500 })
    }

    // Also test the get_user_projects function
    const { data: projects, error: projectsError } = await supabase
      .rpc('get_user_projects', { user_id: user.id })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch projects', details: projectsError }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      user_id: user.id,
      projects: projects,
      message: 'Demo data setup completed and projects fetched successfully'
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/test-setup:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
