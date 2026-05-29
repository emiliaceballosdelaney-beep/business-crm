import { NextResponse } from 'next/server'
import { getValidAccessToken, listSendAs } from '@/lib/google'

export async function GET() {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })
  try {
    const sendAs = await listSendAs(accessToken)
    return NextResponse.json({ sendAs })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
