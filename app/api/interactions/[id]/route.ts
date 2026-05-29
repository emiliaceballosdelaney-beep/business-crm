import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { interaction_type, title, body: bodyText, occurred_at } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (occurred_at && isNaN(Date.parse(occurred_at))) {
    return NextResponse.json({ error: 'Invalid occurred_at format' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('interactions')
    .update({ interaction_type, title: title.trim(), body: bodyText || null, occurred_at })
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
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', id)
    .eq('startup_id', PROSPER_STARTUP_ID)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
