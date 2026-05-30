import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

// GET /api/cron/sync-calendar — called daily by Vercel Cron
// Triggers the Google Calendar sync for all connected calendars.
// Upgrade to Vercel Pro to run more frequently than once per day.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001')

    const res = await fetch(`${host}/api/calendar/sync`, { method: 'POST' })
    const data = await res.json()
    return NextResponse.json({ ok: true, ...data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'sync failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
