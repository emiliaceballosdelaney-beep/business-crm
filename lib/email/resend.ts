import { Resend } from 'resend'

let _client: Resend | null = null

// Lazy init so build-time module evaluation doesn't crash without env vars
export function getResend(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not configured')
    _client = new Resend(key)
  }
  return _client
}

export const FROM_EMAIL = 'Em from Prosper with Em <hello@prosperwithem.com>'
export const REPLY_TO = 'hello@prosperwithem.com'
