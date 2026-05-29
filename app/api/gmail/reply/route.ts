import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, sendGmailReply } from '@/lib/google'
import type { ReplyOpts } from '@/lib/google'

export async function POST(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })

  const opts = await req.json() as ReplyOpts

  try {
    await sendGmailReply(accessToken, opts)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
