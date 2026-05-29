import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const allowed = ['status', 'title', 'amount_cents', 'scope', 'deliverables', 'timeline_weeks', 'labor_hours_saved_weekly', 'notes', 'sent_at']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (body.status === 'sent' && !update.sent_at) {
    update.sent_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(update)
    .eq('id', id)
    .eq('startup_id', PROSPER_STARTUP_ID)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabase.from('proposals').delete().eq('id', id).eq('startup_id', PROSPER_STARTUP_ID)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
