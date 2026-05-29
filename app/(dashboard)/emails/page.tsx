import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import EmailsPage from '@/components/email/EmailsPage'
import type { QueueRow } from '@/components/email/EmailsPage'
import type { InboxClient } from '@/components/email/InboxTab'

export const dynamic = 'force-dynamic'

async function getQueue(): Promise<QueueRow[]> {
  const { data, error } = await supabase
    .from('scheduled_emails')
    .select('id, client_id, workflow_key, step_key, template_key, send_at, status, clients(first_name, last_name)')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .eq('status', 'pending')
    .order('send_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map(row => ({
    ...row,
    clients: Array.isArray(row.clients) ? (row.clients[0] ?? null) : (row.clients ?? null),
  })) as unknown as QueueRow[]
}

async function getClients(): Promise<InboxClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, email')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .not('email', 'is', null)
    .order('first_name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as InboxClient[]
}

export default async function Page() {
  const [queue, clients] = await Promise.all([getQueue(), getClients()])
  return <EmailsPage queue={queue} clients={clients} />
}
