import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { sendEmail } from '@/lib/email/send'
import { getOrCreateIntakeToken } from '@/lib/email/intake-tokens'

const INTAKE_TOKEN_TEMPLATES = new Set(['discovery-invite', 'intake-followup'])
const CALENDLY_TEMPLATES = new Set(['post-discovery-checkin', 'idle-nudge'])

export async function POST(req: Request) {
  let body: { clientId?: string; templateKey?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const { clientId, templateKey } = body

  if (!clientId || !templateKey) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  // Fetch client — scoped to Prosper startup
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, first_name, email, unsubscribed_at')
    .eq('id', clientId)
    .eq('startup_id', PROSPER_STARTUP_ID)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ ok: false, error: 'client_not_found' }, { status: 404 })
  }

  // Build extra template data based on templateKey
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startup-dashboard-five.vercel.app'
  const extraData: Record<string, string> = {}

  if (INTAKE_TOKEN_TEMPLATES.has(templateKey)) {
    try {
      const token = await getOrCreateIntakeToken(clientId)
      extraData.intakeUrl = `${appUrl}/intake/${token}`
    } catch (err) {
      console.error('[email/send] intake token error:', err)
      return NextResponse.json({ ok: false, error: 'intake_token_failed' }, { status: 500 })
    }
  }

  if (CALENDLY_TEMPLATES.has(templateKey)) {
    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL
    if (calendlyUrl) extraData.calendlyUrl = calendlyUrl
  }

  const result = await sendEmail({ client, templateKey, data: extraData })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
