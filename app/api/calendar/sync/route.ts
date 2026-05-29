import { NextResponse } from 'next/server'
import { getGoogleTokens, getValidAccessToken, fetchCalendarEvents, type GCalEvent } from '@/lib/google'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

function extractMeetingUrl(event: GCalEvent): string | null {
  if (event.hangoutLink) return event.hangoutLink
  const videoEntry = event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')
  if (videoEntry?.uri) return videoEntry.uri
  const loc = event.location ?? ''
  if (loc.startsWith('http') || loc.includes('zoom.us')) return loc
  return null
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|tr|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

const BOILERPLATE = [
  /^join zoom meeting$/i,
  /^join with google meet/i,
  /^meeting id\s*:/i,
  /^passcode\s*:/i,
  /^password\s*:/i,
  /^one tap mobile/i,
  /^dial by your location/i,
  /^tap to join/i,
  /^https?:\/\/(meet\.google\.com|[\w-]+\.zoom\.us|zoom\.us)/i,
  /^\+\d[\d\s().-]{6,},+\d+#/,
  /^[•·]\s*\+\d/,
  /^-{3,}$/,
  /^_{3,}$/,
]

function cleanNotes(description: string | undefined, meetingUrl: string | null): string | null {
  if (!description) return null
  const text = /<[a-z][\s\S]*>/i.test(description) ? stripHtml(description) : description
  const lines = text.split('\n').filter(line => {
    const t = line.trim()
    if (!t) return false
    if (meetingUrl && t === meetingUrl) return false
    return !BOILERPLATE.some(re => re.test(t))
  })
  const result = lines.join('\n').trim().replace(/\n{3,}/g, '\n\n')
  return result || null
}

// POST /api/calendar/sync — pull Google Calendar events into meetings table
export async function POST() {
  const tokens = await getGoogleTokens()
  if (!tokens) return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 401 })

  const accessToken = await getValidAccessToken()
  if (!accessToken) return NextResponse.json({ error: 'Token invalid or expired' }, { status: 401 })

  const now     = new Date()
  const timeMin = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const timeMax = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()

  const events = await fetchCalendarEvents(accessToken, tokens.calendar_id, timeMin, timeMax)

  const upserts = events
    .filter(e => e.status !== 'cancelled' && (e.start?.dateTime ?? e.start?.date))
    .map(event => {
      const startDt = (event.start.dateTime ?? event.start.date)!
      const endDt   = event.end?.dateTime ?? event.end?.date
      const durationMinutes = endDt && event.start?.dateTime
        ? Math.round((new Date(endDt).getTime() - new Date(startDt).getTime()) / 60_000)
        : null
      const meetingUrl = extractMeetingUrl(event)
      return supabase.from('meetings').upsert(
        {
          startup_id:       PROSPER_STARTUP_ID,
          google_event_id:  event.id,
          title:            event.summary ?? 'Google Calendar Event',
          date:             new Date(startDt).toISOString(),
          duration_minutes: durationMinutes,
          meeting_url:      meetingUrl,
          notes:            cleanNotes(event.description, meetingUrl),
          status:           'scheduled',
          meeting_type:     'session',
        },
        { onConflict: 'google_event_id' },
      )
    })

  const results = await Promise.allSettled(upserts)
  const imported = results.filter(r => r.status === 'fulfilled').length

  return NextResponse.json({ ok: true, imported })
}
