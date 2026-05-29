import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('messageIds')?.split(',').filter(Boolean) ?? []
  if (!ids.length) return NextResponse.json({})
  const { data } = await supabase.from('email_labels').select('message_id, labels').in('message_id', ids)
  const map: Record<string, string[]> = {}
  for (const row of data ?? []) map[row.message_id] = row.labels
  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  const { messageId, labels } = await req.json() as { messageId: string; labels: string[] }
  const { error } = await supabase.from('email_labels').upsert(
    { message_id: messageId, labels, updated_at: new Date().toISOString() },
    { onConflict: 'message_id' },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
