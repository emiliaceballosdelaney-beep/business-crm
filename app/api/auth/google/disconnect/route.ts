import { NextResponse } from 'next/server'
import { revokeAndDeleteTokens } from '@/lib/google'

export async function POST() {
  await revokeAndDeleteTokens()
  return NextResponse.json({ ok: true })
}
