import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const client_id = searchParams.get('client_id')
  const startup_id = searchParams.get('startup_id')

  let query = supabase
    .from('interactions')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(100)

  if (client_id) query = query.eq('client_id', client_id)
  if (startup_id) query = query.eq('startup_id', startup_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { startup_id, client_id, interaction_type, title, body: note, occurred_at, amount_cents, metadata } = body

  if (!startup_id || !interaction_type || !title) {
    return NextResponse.json({ error: 'startup_id, interaction_type, and title are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('interactions')
    .insert({
      startup_id,
      client_id: client_id ?? null,
      interaction_type,
      title,
      body: note ?? null,
      occurred_at: occurred_at ?? new Date().toISOString(),
      amount_cents: amount_cents ?? null,
      metadata: metadata ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update client's last_contacted_at
  if (client_id) {
    await supabase
      .from('clients')
      .update({ last_contacted_at: occurred_at ?? new Date().toISOString() })
      .eq('id', client_id)
  }

  return NextResponse.json(data, { status: 201 })
}
