import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the function to ensure demo data exists for this user
    const { error } = await supabase.rpc('ensure_demo_data_for_user', {
      user_id: user.id
    })

    if (error) {
      console.error('Error setting up demo data:', error)
      return NextResponse.json({ error: 'Failed to setup demo data' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in POST /api/setup-demo-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
