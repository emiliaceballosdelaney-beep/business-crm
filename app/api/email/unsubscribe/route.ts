import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

// GET /api/email/unsubscribe?id=<client_uuid>
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('id')
  if (!clientId) {
    return new NextResponse('Invalid unsubscribe link.', { status: 400 })
  }

  const { error } = await supabase
    .from('clients')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('startup_id', PROSPER_STARTUP_ID)

  if (error) {
    console.error('[unsubscribe] error:', error)
    return new NextResponse('Something went wrong. Please try again.', { status: 500 })
  }

  // Redirect to a simple confirmation page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startup-dashboard-five.vercel.app'
  return NextResponse.redirect(`${appUrl}/unsubscribed`)
}
