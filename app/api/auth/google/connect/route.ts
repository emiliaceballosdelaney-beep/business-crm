import { NextResponse } from 'next/server'

export async function GET() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const clientId    = process.env.GOOGLE_CLIENT_ID

  if (!redirectUri || !clientId) {
    return NextResponse.json({ error: 'Google credentials not configured' }, { status: 500 })
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.settings.basic',
    ].join(' '),
    access_type:   'offline',
    prompt:        'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
