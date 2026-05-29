import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Verify HMAC signature if signing key is configured
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY
  if (signingKey) {
    const signature = request.headers.get('calendly-webhook-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    const [tPart, v1Part] = signature.split(',')
    const t = tPart?.split('=')[1]
    const v1 = v1Part?.split('=')[1]
    if (!t || !v1) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 })
    }
    const expected = createHmac('sha256', signingKey).update(`${t}.${rawBody}`).digest('hex')
    if (expected !== v1) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body.event as string | undefined

  if (event === 'invitee.created') {
    const payload = body.payload as Record<string, unknown>
    const invitee = payload?.invitee as Record<string, unknown> | undefined
    const scheduledEvent = payload?.scheduled_event as Record<string, unknown> | undefined

    const email = invitee?.email as string | undefined
    const name = invitee?.name as string | undefined
    const startTime = scheduledEvent?.start_time as string | undefined
    const eventName = scheduledEvent?.name as string | undefined
    const calendlyEventUri = scheduledEvent?.uri as string | undefined

    if (!startTime) {
      return NextResponse.json({ error: 'Missing start_time' }, { status: 400 })
    }

    // Dedup: check if this event is already logged
    if (calendlyEventUri) {
      const { data: existing } = await supabase
        .from('meetings')
        .select('id')
        .eq('calendly_event_uri', calendlyEventUri)
        .single()
      if (existing) {
        return NextResponse.json({ received: true, duplicate: true })
      }
    }

    // Look up client by email
    let clientId: string | null = null
    if (email) {
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single()
      clientId = data?.id ?? null
    }

    // Log meeting
    await supabase.from('meetings').insert({
      startup_id: PROSPER_STARTUP_ID,
      client_id: clientId,
      title: eventName ?? `Session with ${name ?? email ?? 'client'}`,
      date: startTime,
      meeting_type: 'session',
      status: 'scheduled',
      calendly_event_uri: calendlyEventUri ?? null,
    })

    // Log calendly_booking interaction
    await supabase.from('interactions').insert({
      startup_id: PROSPER_STARTUP_ID,
      client_id: clientId,
      interaction_type: 'calendly_booking',
      title: `Booked: ${eventName ?? 'session'}`,
      occurred_at: new Date().toISOString(),
      metadata: {
        calendly_event_uri: calendlyEventUri,
        invitee_email: email,
        invitee_name: name,
        start_time: startTime,
      },
    })

    // Update client last_contacted_at
    if (clientId) {
      await supabase
        .from('clients')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', clientId)

      // Auto-create follow_up for 48h after session (post-session check-in)
      const followUpTime = new Date(startTime)
      followUpTime.setHours(followUpTime.getHours() + 48)
      await supabase.from('follow_ups').insert({
        client_id: clientId,
        startup_id: PROSPER_STARTUP_ID,
        due_at: followUpTime.toISOString(),
        reason: 'post_session',
        status: 'pending',
      })
    }
  }

  if (event === 'invitee.cancelled') {
    const payload = body.payload as Record<string, unknown>
    const scheduledEvent = payload?.scheduled_event as Record<string, unknown> | undefined
    const calendlyEventUri = scheduledEvent?.uri as string | undefined

    if (calendlyEventUri) {
      await supabase
        .from('meetings')
        .update({ status: 'cancelled' })
        .eq('calendly_event_uri', calendlyEventUri)
    }
  }

  return NextResponse.json({ received: true })
}
