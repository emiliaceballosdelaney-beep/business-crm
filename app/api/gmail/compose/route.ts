import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, sendGmailMessage } from '@/lib/google'
import type { ComposeOpts } from '@/lib/google'

export async function POST(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })
  const opts = await req.json() as ComposeOpts
  if (!opts.to?.trim() || !opts.subject?.trim()) {
    return NextResponse.json({ error: 'to and subject are required' }, { status: 400 })
  }
  try {
    await sendGmailMessage(accessToken, opts)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
