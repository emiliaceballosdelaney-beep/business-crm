import { supabase } from './supabase'
import { PROSPER_STARTUP_ID } from './constants'

const GOOGLE_TOKEN_URL  = 'https://oauth2.googleapis.com/token'
const GOOGLE_CAL_BASE   = 'https://www.googleapis.com/calendar/v3'
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke'

// ─── Token storage ────────────────────────────────────────────

export type GoogleTokenRow = {
  id: string
  startup_id: string
  access_token: string
  refresh_token: string | null
  token_expiry: string | null
  calendar_id: string
}

export async function getGoogleTokens(): Promise<GoogleTokenRow | null> {
  const { data } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .single()
  return data ?? null
}

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expiry: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description ?? 'Token refresh failed')
  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString()
  return { access_token: data.access_token, expiry }
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getGoogleTokens()
  if (!tokens) return null

  // Return current token if it has >60s remaining
  if (tokens.token_expiry && new Date(tokens.token_expiry) > new Date(Date.now() + 60_000)) {
    return tokens.access_token
  }

  if (!tokens.refresh_token) return null

  const { access_token, expiry } = await refreshAccessToken(tokens.refresh_token)
  await supabase.from('google_tokens').update({
    access_token,
    token_expiry: expiry,
    updated_at:   new Date().toISOString(),
  }).eq('startup_id', PROSPER_STARTUP_ID)

  return access_token
}

export async function revokeAndDeleteTokens(): Promise<void> {
  const tokens = await getGoogleTokens()
  if (tokens?.refresh_token) {
    // Best-effort revoke — ignore failures
    await fetch(`${GOOGLE_REVOKE_URL}?token=${tokens.refresh_token}`, { method: 'POST' }).catch(() => {})
  }
  await supabase.from('google_tokens').delete().eq('startup_id', PROSPER_STARTUP_ID)
}

// ─── Calendar event types ─────────────────────────────────────

export type CalendarEventInput = {
  summary: string
  description?: string | null
  startIso: string  // ISO datetime string
  durationMinutes?: number | null
}

type GCalEventBody = {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end:   { dateTime: string; timeZone: string }
}

function buildEventBody(input: CalendarEventInput): GCalEventBody {
  const start  = new Date(input.startIso)
  const end    = new Date(start.getTime() + (input.durationMinutes ?? 60) * 60_000)
  return {
    summary:     input.summary,
    description: input.description ?? undefined,
    start: { dateTime: start.toISOString(), timeZone: 'America/Los_Angeles' },
    end:   { dateTime: end.toISOString(),   timeZone: 'America/Los_Angeles' },
  }
}

// ─── Calendar CRUD ────────────────────────────────────────────

export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  input: CalendarEventInput,
): Promise<string> {
  const res = await fetch(
    `${GOOGLE_CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEventBody(input)),
    },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to create Google Calendar event')
  return data.id as string
}

export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string,
  input: CalendarEventInput,
): Promise<void> {
  const res = await fetch(
    `${GOOGLE_CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEventBody(input)),
    },
  )
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to update Google Calendar event')
  }
}

export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string,
): Promise<void> {
  const res = await fetch(
    `${GOOGLE_CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
  )
  // 204 = deleted, 404/410 = already gone — both are fine
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Failed to delete calendar event: ${res.status}`)
  }
}

// ─── Gmail re-exports (implementation in lib/gmail.ts) ───────

export type {
  GmailMessageSummary,
  GmailMessageFull,
  GmailSendAs,
  GmailDraftSummary,
  ComposeOpts,
  ReplyOpts,
} from './gmail'

export {
  EMAIL_SIGNATURE,
  listGmailMessages,
  getGmailMessage,
  getGmailThread,
  archiveGmailMessage,
  trashGmailMessage,
  starGmailMessage,
  markGmailMessage,
  sendGmailReply,
  sendGmailMessage,
  listSendAs,
  listGmailDrafts,
  createGmailDraft,
  deleteGmailDraft,
} from './gmail'

// ─── Sync (Google → app) ──────────────────────────────────────

export type GCalEvent = {
  id: string
  summary?: string
  description?: string
  location?: string
  hangoutLink?: string
  conferenceData?: {
    entryPoints?: Array<{ entryPointType: string; uri: string }>
  }
  start: { dateTime?: string; date?: string }
  end?:  { dateTime?: string; date?: string }
  status?: string
  attendees?: Array<{ email: string; displayName?: string; self?: boolean; responseStatus?: string }>
}

export type GCalendarListEntry = {
  id: string
  summary: string
  primary?: boolean
  accessRole: string
}

// Returns all calendars the authenticated account can read (excludes freeBusyReader-only)
export async function listCalendars(accessToken: string): Promise<GCalendarListEntry[]> {
  const res = await fetch(
    `${GOOGLE_CAL_BASE}/users/me/calendarList`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to list Google Calendars')
  const all = (data.items ?? []) as GCalendarListEntry[]
  return all.filter(c => c.accessRole !== 'freeBusyReader')
}

export async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<GCalEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents:  'true',
    orderBy:       'startTime',
    maxResults:    '250',
    showDeleted:   'false',
  })
  const res = await fetch(
    `${GOOGLE_CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to fetch Google Calendar events')
  return (data.items ?? []) as GCalEvent[]
}
