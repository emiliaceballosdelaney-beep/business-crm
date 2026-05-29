import { NextRequest, NextResponse } from 'next/server'
import {
  getGoogleTokens,
  getValidAccessToken,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/google'
import { supabase } from '@/lib/supabase'

// POST /api/calendar/event — create a Google Calendar event for an existing meeting
// Body: { meetingId, title, date, durationMinutes, notes }
export async function POST(req: NextRequest) {
  const tokens = await getGoogleTokens()
  if (!tokens) return NextResponse.json({ ok: false, reason: 'not_connected' })

  const accessToken = await getValidAccessToken()
  if (!accessToken) return NextResponse.json({ ok: false, reason: 'token_invalid' })

  const { meetingId, title, date, durationMinutes, notes } = await req.json()

  try {
    const googleEventId = await createCalendarEvent(accessToken, tokens.calendar_id, {
      summary:         title,
      description:     notes ?? null,
      startIso:        date,
      durationMinutes: durationMinutes ?? 60,
    })

    // Store google_event_id on the meeting record
    await supabase.from('meetings').update({ google_event_id: googleEventId }).eq('id', meetingId)

    return NextResponse.json({ ok: true, googleEventId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, reason: msg }, { status: 500 })
  }
}

// PUT /api/calendar/event — update the linked Google Calendar event
// Body: { googleEventId, title, date, durationMinutes, notes }
export async function PUT(req: NextRequest) {
  const tokens = await getGoogleTokens()
  if (!tokens) return NextResponse.json({ ok: false, reason: 'not_connected' })

  const accessToken = await getValidAccessToken()
  if (!accessToken) return NextResponse.json({ ok: false, reason: 'token_invalid' })

  const { googleEventId, title, date, durationMinutes, notes } = await req.json()
  if (!googleEventId) return NextResponse.json({ ok: false, reason: 'no_google_event_id' })

  try {
    await updateCalendarEvent(accessToken, tokens.calendar_id, googleEventId, {
      summary:         title,
      description:     notes ?? null,
      startIso:        date,
      durationMinutes: durationMinutes ?? 60,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, reason: msg }, { status: 500 })
  }
}

// DELETE /api/calendar/event — remove the linked Google Calendar event
// Body: { googleEventId }
export async function DELETE(req: NextRequest) {
  const tokens = await getGoogleTokens()
  if (!tokens) return NextResponse.json({ ok: false, reason: 'not_connected' })

  const accessToken = await getValidAccessToken()
  if (!accessToken) return NextResponse.json({ ok: false, reason: 'token_invalid' })

  const { googleEventId } = await req.json()
  if (!googleEventId) return NextResponse.json({ ok: true }) // nothing to delete

  try {
    await deleteCalendarEvent(accessToken, tokens.calendar_id, googleEventId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, reason: msg }, { status: 500 })
  }
}
