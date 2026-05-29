import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, cancelled_reason } = body

  const update: Record<string, unknown> = {}
  if (status) update.status = status
  if (cancelled_reason) update.cancelled_reason = cancelled_reason

  const { error } = await supabase
    .from('scheduled_emails')
    .update(update)
    .eq('id', id)
    .eq('startup_id', PROSPER_STARTUP_ID)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
