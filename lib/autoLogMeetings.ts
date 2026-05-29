import { supabase } from './supabase'
import { PROSPER_STARTUP_ID, DIRECT_CONTACT_TYPES } from './constants'
import { enqueueWorkflow } from './email/scheduler'

// session + discovery meetings with a client involve direct client contact
const CLIENT_MEETING_TYPES = ['session', 'discovery']

// Maps meeting_type → interaction_type for auto-logged entries
const MEETING_TO_INTERACTION: Record<string, string> = {
  session:   'session',
  discovery: 'discovery',
}

/**
 * Finds past client-facing meetings (session, discovery) that haven't been
 * auto-logged as interactions yet, inserts them, then updates last_contacted_at
 * for each affected client based on their most recent direct-contact interaction.
 *
 * Pass clientId to scope to a single client; omit to process all clients.
 */
export async function autoLogPastMeetings(clientId?: string) {
  const now = new Date().toISOString()

  let query = supabase
    .from('meetings')
    .select('id, title, date, meeting_type, client_id')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .lt('date', now)
    .in('meeting_type', CLIENT_MEETING_TYPES)
    .not('client_id', 'is', null)

  if (clientId) query = query.eq('client_id', clientId)

  const { data: meetings } = await query
  if (!meetings?.length) return

  // Find which meetings are already logged
  const meetingIds = meetings.map(m => m.id)
  const { data: existing } = await supabase
    .from('interactions')
    .select('meeting_id')
    .in('meeting_id', meetingIds)

  const loggedIds = new Set((existing ?? []).map(e => e.meeting_id as string))
  const toLog = meetings.filter(m => !loggedIds.has(m.id))
  if (!toLog.length) return

  // Insert one interaction per unlogged meeting
  await supabase.from('interactions').insert(
    toLog.map(m => ({
      startup_id:       PROSPER_STARTUP_ID,
      client_id:        m.client_id,
      meeting_id:       m.id,
      interaction_type: MEETING_TO_INTERACTION[m.meeting_type as string],
      title:            m.title,
      body:             null,
      occurred_at:      m.date,
    }))
  )

  // Update last_contacted_at for each affected client + trigger post-discovery workflow
  const affectedClientIds = Array.from(new Set(toLog.map(m => m.client_id as string)))
  const discoveryClientIds = new Set(
    toLog.filter(m => m.meeting_type === 'discovery').map(m => m.client_id as string)
  )

  await Promise.all(
    affectedClientIds.map(async (cid) => {
      const { data: latest } = await supabase
        .from('interactions')
        .select('occurred_at')
        .eq('client_id', cid)
        .in('interaction_type', [...DIRECT_CONTACT_TYPES])
        .order('occurred_at', { ascending: false })
        .limit(1)
        .single()
      if (latest) {
        await supabase
          .from('clients')
          .update({ last_contacted_at: latest.occurred_at })
          .eq('id', cid)
      }

      // Kick off post-discovery email sequence for newly-logged discovery meetings
      if (discoveryClientIds.has(cid)) {
        enqueueWorkflow(cid, 'post_discovery')
          .catch(err => console.error('[autoLog] post_discovery enqueue error:', err))
      }
    })
  )
}
