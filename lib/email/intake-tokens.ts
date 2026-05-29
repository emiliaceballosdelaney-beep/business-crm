import { supabase } from '../supabase'
import { randomBytes } from 'crypto'

const TOKEN_EXPIRY_DAYS = 30

export async function createIntakeToken(clientId: string): Promise<string> {
  const token = randomBytes(24).toString('hex')
  const expires_at = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('intake_tokens')
    .insert({ client_id: clientId, token, expires_at })

  if (error) {
    console.error('[intake-tokens] createIntakeToken error:', error)
    throw error
  }

  return token
}

// Returns the most recent valid (unused, unexpired) token for a client, or null
export async function getActiveToken(clientId: string): Promise<string | null> {
  const { data } = await supabase
    .from('intake_tokens')
    .select('token, expires_at, used_at')
    .eq('client_id', clientId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data?.token ?? null
}

// Returns existing token or creates a fresh one
export async function getOrCreateIntakeToken(clientId: string): Promise<string> {
  const existing = await getActiveToken(clientId)
  if (existing) return existing
  return createIntakeToken(clientId)
}

export type ValidatedToken = {
  id: string
  client_id: string
}

export async function validateIntakeToken(token: string): Promise<ValidatedToken | null> {
  const { data } = await supabase
    .from('intake_tokens')
    .select('id, client_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!data) return null
  if (data.used_at) return null
  if (new Date(data.expires_at) < new Date()) return null

  return { id: data.id, client_id: data.client_id }
}

export async function markTokenUsed(tokenId: string) {
  await supabase
    .from('intake_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId)
}
