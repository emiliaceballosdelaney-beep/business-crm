import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, sendGmailMessage, listSendAs } from '@/lib/google'
import type { ComposeOpts } from '@/lib/google'

export async function POST(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })

  const opts = await req.json() as ComposeOpts
  if (!opts.to?.trim() || !opts.subject?.trim()) {
    return NextResponse.json({ error: 'to and subject are required' }, { status: 400 })
  }

  // RFC 2822 requires a From header — fetch the default sendAs if the client didn't supply one
  if (!opts.from?.trim()) {
    try {
      const sendAs = await listSendAs(accessToken)
      const def = sendAs.find(s => s.isDefault) ?? sendAs[0]
      if (def) {
        opts.from = def.displayName && def.displayName !== def.sendAsEmail
          ? `${def.displayName} <${def.sendAsEmail}>`
          : def.sendAsEmail
      }
    } catch {}
  }

  try {
    await sendGmailMessage(accessToken, opts)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[compose] Gmail send failed:', msg, { to: opts.to, from: opts.from, subject: opts.subject })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
