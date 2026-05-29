import { supabase } from './supabase'

export async function deleteClient(id: string): Promise<string | null> {
  // meetings.client_id has no ON DELETE clause (RESTRICT) — must clear it before deleting the client.
  // Other FKs (interactions, tasks, projects) are SET NULL; email tables are CASCADE — DB handles those.
  const { error: meetingErr } = await supabase
    .from('meetings')
    .update({ client_id: null })
    .eq('client_id', id)
  if (meetingErr) return meetingErr.message

  const { error } = await supabase.from('clients').delete().eq('id', id)
  return error ? error.message : null
}
