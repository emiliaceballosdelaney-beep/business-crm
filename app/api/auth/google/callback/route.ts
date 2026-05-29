import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startup-dashboard-five.vercel.app'

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${BASE_URL}/meetings?google_error=${error ?? 'no_code'}`)
  }

  const redirectUri  = process.env.GOOGLE_REDIRECT_URI!
  const clientId     = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) {
    return NextResponse.redirect(`${BASE_URL}/meetings?google_error=token_exchange`)
  }

  const expiry = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

  const { error: dbError } = await supabase.from('google_tokens').upsert(
    {
      startup_id:    PROSPER_STARTUP_ID,
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      token_expiry:  expiry,
      updated_at:    new Date().toISOString(),
    },
    { onConflict: 'startup_id' },
  )

  if (dbError) {
    return NextResponse.redirect(`${BASE_URL}/meetings?google_error=db_error`)
  }

  return NextResponse.redirect(`${BASE_URL}/meetings?google_connected=1`)
}
