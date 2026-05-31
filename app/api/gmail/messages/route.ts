import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, listGmailMessages, getGmailMessage, archiveGmailMessage, trashGmailMessage, markGmailMessage, starGmailMessage } from '@/lib/google'

const FOLDER_QUERIES: Record<string, string> = {
  inbox:    'in:inbox',
  starred:  'is:starred',
  archived: '-in:inbox -in:trash -in:spam',
  all:      'in:all',
  trash:    'in:trash',
}

export async function GET(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })

  const messageId = req.nextUrl.searchParams.get('messageId')
  if (messageId) {
    try {
      const message = await getGmailMessage(accessToken, messageId)
      return NextResponse.json(message)
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 })
    }
  }

  const folder  = req.nextUrl.searchParams.get('folder') ?? 'inbox'
  const qParam  = req.nextUrl.searchParams.get('q')
  const query   = qParam ? qParam : (FOLDER_QUERIES[folder] ?? 'in:inbox')
  try {
    const messages = await listGmailMessages(accessToken, query)
    return NextResponse.json({ messages })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let accessToken: string | null = null
  try { accessToken = await getValidAccessToken() } catch {}
  if (!accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 401 })

  const { messageId, action } = await req.json() as { messageId: string; action: string }
  try {
    if      (action === 'archive')      await archiveGmailMessage(accessToken, messageId)
    else if (action === 'trash')        await trashGmailMessage(accessToken, messageId)
    else if (action === 'mark_read')    await markGmailMessage(accessToken, messageId, true)
    else if (action === 'mark_unread')  await markGmailMessage(accessToken, messageId, false)
    else if (action === 'star')         await starGmailMessage(accessToken, messageId, true)
    else if (action === 'unstar')       await starGmailMessage(accessToken, messageId, false)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
