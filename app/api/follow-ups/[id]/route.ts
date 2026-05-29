import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, snoozed_until } = body

  const update: Record<string, unknown> = {}
  if (status) update.status = status
  if (snoozed_until) update.snoozed_until = snoozed_until

  const { data, error } = await supabase
    .from('follow_ups')
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
  const { error } = await supabase.from('follow_ups').delete().eq('id', id).eq('startup_id', PROSPER_STARTUP_ID)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
