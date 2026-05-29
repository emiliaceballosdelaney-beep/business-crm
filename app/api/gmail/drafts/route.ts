import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, listGmailDrafts, createGmailDraft, deleteGmailDraft } from '@/lib/google'
import type { ComposeOpts } from '@/lib/google'

export async function GET() {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })
  try {
    const drafts = await listGmailDrafts(accessToken)
    return NextResponse.json({ drafts })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })
  const body = await req.json() as ComposeOpts & { threadId?: string }
  try {
    const result = await createGmailDraft(accessToken, body)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })
  const draftId = req.nextUrl.searchParams.get('draftId')
  if (!draftId) return NextResponse.json({ error: 'draftId required' }, { status: 400 })
  try {
    await deleteGmailDraft(accessToken, draftId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
