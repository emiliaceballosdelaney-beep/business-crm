import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { autoLogPastMeetings } from '@/lib/autoLogMeetings'
import ClientsDirectory from '@/components/clients/ClientsDirectory'
import type { ClientRow } from '@/components/clients/types'

export const dynamic = 'force-dynamic'

async function getClients(): Promise<ClientRow[]> {
  await autoLogPastMeetings()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, first_name, last_name, email, phone, lead_stage, service_type, last_contacted_at, updated_at')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .order('first_name', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map(c => ({
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
}

export default async function ClientsPage() {
  const clients = await getClients()
  return <ClientsDirectory clients={clients} />
}
