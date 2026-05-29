import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startup_id = searchParams.get('startup_id')
  const client_id = searchParams.get('client_id')
  const status = searchParams.get('status') ?? 'pending'

  let query = supabase
    .from('follow_ups')
    .select('*, client:client_id(id, name, email, startup_id, lead_stage, last_contacted_at)')
    .order('due_at', { ascending: true })

  if (startup_id) query = query.eq('startup_id', startup_id)
  if (client_id) query = query.eq('client_id', client_id)
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { client_id, startup_id, due_at, reason } = body

  if (!client_id || !startup_id || !due_at) {
    return NextResponse.json({ error: 'client_id, startup_id, and due_at are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('follow_ups')
    .insert({ client_id, startup_id, due_at, reason: reason ?? 'manual', status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
