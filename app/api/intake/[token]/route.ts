import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { validateIntakeToken, markTokenUsed } from '@/lib/email/intake-tokens'

interface Params {
  params: Promise<{ token: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  const body = await req.json()
  const { clientId, responses } = body

  if (!clientId || !responses || typeof responses !== 'object') {
    return NextResponse.json({ error: 'clientId and responses are required' }, { status: 400 })
  }

  // Validate token is still valid
  const validated = await validateIntakeToken(token)
  if (!validated || validated.client_id !== clientId) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }

  // Save responses + mark token used + log interaction in parallel
  const [responseResult] = await Promise.all([
    supabase.from('intake_responses').insert({
      client_id:    clientId,
      responses,
      submitted_at: new Date().toISOString(),
    }),
    markTokenUsed(validated.id),
    supabase.from('interactions').insert({
      startup_id:       PROSPER_STARTUP_ID,
      client_id:        clientId,
      interaction_type: 'note',
      title:            'Intake form submitted',
      body:             JSON.stringify(responses, null, 2),
      occurred_at:      new Date().toISOString(),
    }),
  ])

  if (responseResult.error) {
    console.error('[intake POST] error saving responses:', responseResult.error)
    return NextResponse.json({ error: 'Failed to save your answers' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
