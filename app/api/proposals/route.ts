import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startup_id = searchParams.get('startup_id')
  const client_id = searchParams.get('client_id')

  let query = supabase
    .from('proposals')
    .select('*, client:client_id(id, name)')
    .order('created_at', { ascending: false })

  if (startup_id) query = query.eq('startup_id', startup_id)
  if (client_id) query = query.eq('client_id', client_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { startup_id, client_id, title, amount_cents, scope, deliverables, timeline_weeks, labor_hours_saved_weekly, notes } = body

  if (!startup_id || !title) {
    return NextResponse.json({ error: 'startup_id and title are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      startup_id,
      client_id: client_id ?? null,
      title,
      amount_cents: amount_cents ?? null,
      scope: scope ?? null,
      deliverables: deliverables ?? null,
      timeline_weeks: timeline_weeks ?? null,
      labor_hours_saved_weekly: labor_hours_saved_weekly ?? null,
      notes: notes ?? null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
