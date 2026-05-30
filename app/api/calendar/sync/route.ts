import { NextResponse } from 'next/server'
import { getGoogleTokens, getValidAccessToken, listCalendars, fetchCalendarEvents, type GCalEvent } from '@/lib/google'
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

const HOLIDAY_RE = /\b(holiday|day off|day-off|observance|new year|valentine|st\.?\s?patrick|saint patrick|easter|mother.?s day|memorial day|father.?s day|juneteenth|flag day|independence day|fourth of july|4th of july|labor day|columbus day|indigenous peoples|halloween|veterans?\s?day|thanksgiving|christmas|hanukkah|chanukah|kwanzaa|martin luther king|mlk day|presidents?\s?day|mardi gras|earth day|tax day)\b/i

// Titles that are always personal regardless of attendees (travel, accommodation, etc.)
const ALWAYS_PERSONAL_RE = /\b(stay at|staying at|check.?in|check.?out|flight|hotel|airbnb|vrbo|hostel|resort|road trip|travel to|flying to|drive to)\b/i

// Infer meeting type from title keywords + calendar name.
// Holidays and always-personal patterns are checked before client match.
function inferMeetingType(
  title: string,
  calendarName: string,
  hasClientMatch: boolean,
): 'session' | 'discovery' | 'internal' | 'personal' | 'holiday' {
  const t = title.toLowerCase()

  if (HOLIDAY_RE.test(t)) return 'holiday'
  if (ALWAYS_PERSONAL_RE.test(t)) return 'personal'

  if (hasClientMatch) {
    return /discovery|intro|consult/.test(t) ? 'discovery' : 'session'
  }

  if (/discovery|intro call|consult/.test(t)) return 'discovery'
  if (/team|all.?hands|stand.?up|sprint|planning|retrospective/.test(t)) return 'internal'
  if (/dentist|doctor|gym|workout|haircut|birthday|vacation|appointment|personal/.test(t)) return 'personal'

  // Calendar name as fallback signal — "Personal" calendar = personal event
  if (calendarName === 'Personal') return 'personal'

  // Default for Business/workspace events with no other signal
  return 'internal'
}

// Match an event's attendees against client emails. Skips self (Emilia's own entry).
function matchClientId(
  attendees: GCalEvent['attendees'],
  clientsByEmail: Map<string, string>,
): string | null {
  if (!attendees) return null
  for (const a of attendees) {
    if (a.self) continue
    const id = clientsByEmail.get(a.email.toLowerCase())
    if (id) return id
  }
  return null
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

  // Fetch calendars + clients in parallel
  const [calendars, { data: clientRows }] = await Promise.all([
    listCalendars(accessToken),
    supabase
      .from('clients')
      .select('id, email')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .not('email', 'is', null),
  ])

  console.log('[sync] calendars found:', calendars.map(c => `${c.summary} (${c.id}) role=${c.accessRole}`))

  // Build email → client_id lookup (case-insensitive)
  const clientsByEmail = new Map<string, string>(
    (clientRows ?? []).filter(c => c.email).map(c => [c.email!.toLowerCase(), c.id])
  )

  // Fetch existing manually-set client_id values so we don't overwrite manual links
  const { data: existingRows } = await supabase
    .from('meetings')
    .select('google_event_id, client_id')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .not('google_event_id', 'is', null)
    .not('client_id', 'is', null)

  const manualClientIds = new Map<string, string>(
    (existingRows ?? []).map(r => [r.google_event_id, r.client_id])
  )

  const calendarResults = await Promise.allSettled(
    calendars.map(async cal => {
      const evs = await fetchCalendarEvents(accessToken, cal.id, timeMin, timeMax)
      console.log(`[sync] ${cal.summary}: ${evs.length} events`)
      return evs.map(e => ({ event: e, calendarName: cal.summary }))
    })
  )

  calendarResults.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[sync] calendar "${calendars[i]?.summary}" failed:`, r.reason)
  })

  const allCalendarEvents = calendarResults
    .filter((r): r is PromiseFulfilledResult<{ event: GCalEvent; calendarName: string }[]> => r.status === 'fulfilled')
    .map(r => r.value)

  // Deduplicate by google_event_id — first calendar wins
  const seen = new Set<string>()
  const taggedEvents = allCalendarEvents.flat().filter(({ event }) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })

  const upserts = taggedEvents
    .filter(({ event: e }) => e.status !== 'cancelled' && (e.start?.dateTime ?? e.start?.date))
    .map(({ event, calendarName }) => {
      const startDt = (event.start.dateTime ?? event.start.date)!
      const endDt   = event.end?.dateTime ?? event.end?.date
      const durationMinutes = endDt && event.start?.dateTime
        ? Math.round((new Date(endDt).getTime() - new Date(startDt).getTime()) / 60_000)
        : null
      const meetingUrl = extractMeetingUrl(event)

      // Prefer manually-set client link; fall back to attendee email match
      const client_id = manualClientIds.get(event.id) ?? matchClientId(event.attendees, clientsByEmail)
      const meeting_type = inferMeetingType(event.summary ?? '', calendarName, client_id !== null)

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
          meeting_type,
          client_id,
          source_calendar:  calendarName,
        },
        { onConflict: 'google_event_id' },
      )
    })

  const results = await Promise.allSettled(upserts)
  const imported = results.filter(r => r.status === 'fulfilled').length
  const calendarsFailed = calendarResults.filter(r => r.status === 'rejected').length

  return NextResponse.json({ ok: true, imported, calendarsScanned: calendarResults.length, calendarsFailed })
}
