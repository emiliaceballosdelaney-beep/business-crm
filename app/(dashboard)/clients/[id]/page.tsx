import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { autoLogPastMeetings } from '@/lib/autoLogMeetings'
import ClientDetail from '@/components/clients/ClientDetail'
import type { ClientDetailRow, InteractionRow, MeetingDetailRow, TaskDetailRow } from '@/components/clients/types'

export const dynamic = 'force-dynamic'

async function getClientDetail(id: string) {
  await autoLogPastMeetings(id)
  const [
    { data: client, error: clientErr },
    { data: interactions, error: interactionsErr },
    { data: meetings, error: meetingsErr },
    { data: tasks, error: tasksErr },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, first_name, last_name, email, phone, lead_stage, service_type, start_date, end_date, occupation, location, referred_by, source, income_range, income_source, savings, investments, debt_notes, finance_tools, goals, challenges, notes')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single(),
    supabase
      .from('interactions')
      .select('id, interaction_type, title, body, occurred_at')
      .eq('client_id', id)
      .order('occurred_at', { ascending: false })
      .limit(20),
    supabase
      .from('meetings')
      .select('id, title, date, duration_minutes, meeting_type, notes, meeting_url, google_event_id')
      .eq('client_id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('date', { ascending: false })
      .limit(20),
    supabase
      .from('tasks')
      .select('id, title, status, priority, description, due_date, created_at, project:projects!project_id(title), milestone:milestones!milestone_id(title)')
      .eq('client_id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at', { ascending: false }),
  ])

  if (interactionsErr) throw new Error(interactionsErr.message)
  if (meetingsErr)     throw new Error(meetingsErr.message)
  if (tasksErr)        throw new Error(tasksErr.message)
  // clientErr with .single() returns PGRST116 when not found — let notFound() handle that
  if (clientErr && clientErr.code !== 'PGRST116') throw new Error(clientErr.message)
  if (!client) notFound()

  let referredByName: string | null = null
  if (client.referred_by) {
    const { data: referrer, error: referrerErr } = await supabase
      .from('clients')
      .select('name')
      .eq('id', client.referred_by)
      .single()
    if (referrerErr && referrerErr.code !== 'PGRST116') {
      console.error('Referrer lookup failed:', referrerErr.message)
    }
    referredByName = referrer?.name ?? null
  }

  const row: ClientDetailRow = {
    ...client,
    goals: Array.isArray(client.goals) ? client.goals : null,
  }

  // Normalize Supabase join arrays to single objects at fetch boundary
  const normalizedTasks = (tasks ?? []).map(t => ({
    ...t,
    project:   Array.isArray(t.project)   ? (t.project[0]   ?? null) : (t.project   ?? null),
    milestone: Array.isArray(t.milestone) ? (t.milestone[0] ?? null) : (t.milestone ?? null),
  }))

  return {
    client: row,
    referredByName,
    interactions: (interactions ?? []) as InteractionRow[],
    meetings:     (meetings      ?? []) as MeetingDetailRow[],
    tasks:        normalizedTasks        as unknown as TaskDetailRow[],
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getClientDetail(id)
  return <ClientDetail {...data} />
}
