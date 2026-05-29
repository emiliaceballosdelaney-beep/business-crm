import { NextResponse } from 'next/server'
import { getGoogleTokens } from '@/lib/google'

export async function GET() {
  const tokens = await getGoogleTokens()
  return NextResponse.json({ connected: !!tokens })
}
