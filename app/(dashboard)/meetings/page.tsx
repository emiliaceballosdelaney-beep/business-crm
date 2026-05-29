import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { getGoogleTokens } from '@/lib/google'
import MeetingsPage from '@/components/meetings/MeetingsPage'
import type { MeetingRow } from '@/components/meetings/MeetingCard'

export const dynamic = 'force-dynamic'

async function getMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, date, duration_minutes, meeting_type, notes, status, meeting_url, google_event_id, source_calendar, client:clients!client_id(id, name)')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .not('status', 'eq', 'cancelled')
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)

  // Supabase join typing returns client as array; normalize to single object at fetch boundary
  return (data ?? []).map(m => ({
    ...m,
    client: Array.isArray(m.client) ? (m.client[0] ?? null) : (m.client ?? null),
  })) as unknown as MeetingRow[]
}

export default async function Page() {
  const [meetings, tokens] = await Promise.all([getMeetings(), getGoogleTokens()])
  return <MeetingsPage meetings={meetings} googleConnected={!!tokens} />
}
