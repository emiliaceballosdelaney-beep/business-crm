import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, getGmailThread } from '@/lib/google'

export async function GET(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })
  const threadId = req.nextUrl.searchParams.get('threadId')
  if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 })
  try {
    const messages = await getGmailThread(accessToken, threadId)
    return NextResponse.json({ messages })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
