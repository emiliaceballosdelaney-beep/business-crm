import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { autoLogPastMeetings } from '@/lib/autoLogMeetings'
import ClientsKanban from '@/components/clients/ClientsKanban'
import type { ClientRow, NextMeeting } from '@/components/clients/types'

export const dynamic = 'force-dynamic'

async function getClientsData() {
  await autoLogPastMeetings()
  const now = new Date().toISOString()

  const [
    { data: clients, error: clientsErr },
    { data: meetings, error: meetingsErr },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, first_name, last_name, email, phone, lead_stage, service_type, last_contacted_at, updated_at')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('name'),
    supabase
      .from('meetings')
      .select('client_id, date, meeting_type')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .gte('date', now)
      .not('status', 'eq', 'cancelled')
      .order('date'),
  ])

  if (clientsErr) throw new Error(clientsErr.message)
  if (meetingsErr) throw new Error(meetingsErr.message)

  const nextMeetingByClient: Record<string, NextMeeting> = {}
  for (const m of (meetings ?? [])) {
    if (m.client_id && !nextMeetingByClient[m.client_id]) {
      nextMeetingByClient[m.client_id] = m as NextMeeting
    }
  }

  const rows: ClientRow[] = (clients ?? []).map(c => ({
    id: c.id,
    name: c.name,
    first_name: (c as Record<string, unknown>).first_name as string ?? '',
    last_name:  (c as Record<string, unknown>).last_name  as string ?? '',
    email: c.email ?? null,
    phone: c.phone ?? null,
    lead_stage: c.lead_stage ?? 'lead',
    service_type: (c as Record<string, unknown>).service_type as string | null ?? null,
    last_contacted: c.last_contacted_at ?? null,
    updated_at: c.updated_at,
  }))

  return { clients: rows, nextMeetingByClient }
}

export default async function PipelinePage() {
  const { clients, nextMeetingByClient } = await getClientsData()
  return <ClientsKanban clients={clients} nextMeetingByClient={nextMeetingByClient} />
}
