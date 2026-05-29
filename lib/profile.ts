import { supabase } from './supabase'
import { PROSPER_STARTUP_ID } from './constants'

export async function getProfileAvatar(): Promise<string | null> {
  const { data } = await supabase
    .from('profile')
    .select('avatar_url')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .single()
  return data?.avatar_url ?? null
}

export async function setProfileAvatar(url: string): Promise<void> {
  await supabase
    .from('profile')
    .upsert({ startup_id: PROSPER_STARTUP_ID, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: 'startup_id' })
}
