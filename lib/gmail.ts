const GOOGLE_GMAIL_BASE = 'https://www.googleapis.com/gmail/v1'

// ─── Gmail types ──────────────────────────────────────────────

export type GmailMessageSummary = {
  id:        string
  threadId:  string
  snippet:   string
  date:      string  // ISO string
  from:      string
  to:        string
  subject:   string
  isUnread:  boolean
  isStarred: boolean
}

export type GmailMessageFull = GmailMessageSummary & {
  body:            string  // decoded plain text
  emailMessageId:  string  // Message-ID header (for In-Reply-To threading)
  emailReferences: string  // References header
}

export type GmailSendAs = {
  sendAsEmail: string
  displayName: string
  isDefault:   boolean
}

export type GmailDraftSummary = {
  draftId:   string
  messageId: string
  threadId:  string
  snippet:   string
  date:      string
  to:        string
  subject:   string
}

export type ComposeOpts = {
  from?:          string
  to:             string
  subject:        string
  body:           string
  signatureHtml?: string
}

export type ReplyOpts = ComposeOpts & {
  threadId:    string
  inReplyTo?:  string
  references?: string
}

export const EMAIL_SIGNATURE = `--\nEmilia Ceballos\nProsper with Em\nprosperwithem.com`

// ─── Internal helpers ─────────────────────────────────────────

function textToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

const HTML_SIGNATURE = `<br><br>--<br><img src="https://startup-dashboard-five.vercel.app/prosper_with_em_logo_transparent.png" alt="Prosper with Em" style="height:40px;width:auto;display:block;margin-bottom:6px;"><strong>Emilia Ceballos</strong><br><a href="https://prosperwithem.com" style="color:#640015;text-decoration:none;">prosperwithem.com</a>`

function decodeBase64url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
  try { return Buffer.from(base64, 'base64').toString('utf-8') } catch { return '' }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim()
}

export function extractPlainBody(payload: Record<string, unknown>): string {
  const mimeType = payload?.mimeType as string | undefined
  const body     = payload?.body as { data?: string } | undefined
  const parts    = payload?.parts as Array<Record<string, unknown>> | undefined

  if (mimeType === 'text/plain' && body?.data) return decodeBase64url(body.data)

  if (parts) {
    const plain = parts.find(p => (p.mimeType as string) === 'text/plain')
    if (plain) { const b = plain.body as { data?: string }; if (b?.data) return decodeBase64url(b.data) }
    const html = parts.find(p => (p.mimeType as string) === 'text/html')
    if (html) { const b = html.body as { data?: string }; if (b?.data) return stripHtml(decodeBase64url(b.data)) }
    for (const part of parts) {
      if (part.parts) { const nested = extractPlainBody(part); if (nested) return nested }
    }
  }

  if (mimeType === 'text/html' && body?.data) return stripHtml(decodeBase64url(body.data))
  if (body?.data) return decodeBase64url(body.data)
  return ''
}

export function parseGmailHeaders(headers: Array<{ name: string; value: string }>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const h of headers) out[h.name.toLowerCase()] = h.value
  return out
}

function buildMimeRaw(opts: {
  from?: string; to: string; subject: string; body: string;
  inReplyTo?: string; references?: string; signatureHtml?: string;
}): string {
  const sig = opts.signatureHtml !== undefined ? opts.signatureHtml : HTML_SIGNATURE
  const htmlBody = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">${opts.body}${sig}</div>`
  const lines = [
    opts.from      ? `From: ${opts.from}`               : null,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    opts.inReplyTo  ? `In-Reply-To: ${opts.inReplyTo}`  : null,
    opts.references ? `References: ${opts.references}`  : null,
    '',
    htmlBody,
  ].filter((l): l is string => l !== null).join('\r\n')
  return Buffer.from(lines).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ─── List / fetch messages ────────────────────────────────────

async function fetchGmailMeta(accessToken: string, messageId: string): Promise<GmailMessageSummary> {
  const fields = ['From', 'To', 'Subject', 'Date'].map(h => `metadataHeaders=${h}`).join('&')
  const res = await fetch(
    `${GOOGLE_GMAIL_BASE}/users/me/messages/${messageId}?format=metadata&${fields}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await res.json()
  const h = parseGmailHeaders(data.payload?.headers ?? [])
  return {
    id:       data.id,
    threadId: data.threadId,
    snippet:  data.snippet ?? '',
    date:     new Date(parseInt(data.internalDate ?? '0')).toISOString(),
    from:     h['from'] ?? '',
    to:       h['to']   ?? '',
    subject:  h['subject'] ?? '(no subject)',
    isUnread:  (data.labelIds as string[] ?? []).includes('UNREAD'),
    isStarred: (data.labelIds as string[] ?? []).includes('STARRED'),
  }
}

export async function listGmailMessages(
  accessToken: string,
  query = 'in:inbox',
  maxResults = 20,
): Promise<GmailMessageSummary[]> {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) })
  const listRes = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const listData = await listRes.json()
  if (!listRes.ok) throw new Error(listData.error?.message ?? 'Failed to list Gmail messages')

  const ids: Array<{ id: string; threadId: string }> = listData.messages ?? []
  if (!ids.length) return []

  const results = await Promise.allSettled(
    ids.map(({ id }) => fetchGmailMeta(accessToken, id)),
  )
  return results
    .filter((r): r is PromiseFulfilledResult<GmailMessageSummary> => r.status === 'fulfilled')
    .map(r => r.value)
}

export async function getGmailMessage(accessToken: string, messageId: string): Promise<GmailMessageFull> {
  const res = await fetch(
    `${GOOGLE_GMAIL_BASE}/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to fetch Gmail message')
  const h = parseGmailHeaders(data.payload?.headers ?? [])
  return {
    id:              data.id,
    threadId:        data.threadId,
    snippet:         data.snippet ?? '',
    date:            new Date(parseInt(data.internalDate ?? '0')).toISOString(),
    from:            h['from']       ?? '',
    to:              h['to']         ?? '',
    subject:         h['subject']    ?? '(no subject)',
    isUnread:        (data.labelIds as string[] ?? []).includes('UNREAD'),
    isStarred:       (data.labelIds as string[] ?? []).includes('STARRED'),
    body:            extractPlainBody(data.payload ?? {}),
    emailMessageId:  h['message-id'] ?? '',
    emailReferences: h['references'] ?? '',
  }
}

export async function getGmailThread(accessToken: string, threadId: string): Promise<GmailMessageFull[]> {
  const res = await fetch(
    `${GOOGLE_GMAIL_BASE}/users/me/threads/${threadId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to fetch Gmail thread')
  const messages: Array<Record<string, unknown>> = data.messages ?? []
  return messages
    .map((msg): GmailMessageFull => {
      const h = parseGmailHeaders(
        (msg.payload as { headers?: Array<{ name: string; value: string }> })?.headers ?? [],
      )
      return {
        id:              msg.id as string,
        threadId:        msg.threadId as string,
        snippet:         (msg.snippet as string) ?? '',
        date:            new Date(parseInt((msg.internalDate as string) ?? '0')).toISOString(),
        from:            h['from']       ?? '',
        to:              h['to']         ?? '',
        subject:         h['subject']    ?? '(no subject)',
        isUnread:        (msg.labelIds as string[] ?? []).includes('UNREAD'),
        isStarred:       (msg.labelIds as string[] ?? []).includes('STARRED'),
        body:            extractPlainBody((msg.payload as Record<string, unknown>) ?? {}),
        emailMessageId:  h['message-id'] ?? '',
        emailReferences: h['references'] ?? '',
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// ─── Modify messages ──────────────────────────────────────────

export async function archiveGmailMessage(accessToken: string, messageId: string): Promise<void> {
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages/${messageId}/modify`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ removeLabelIds: ['INBOX'] }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to archive message')
  }
}

export async function starGmailMessage(accessToken: string, messageId: string, star: boolean): Promise<void> {
  const body = star ? { addLabelIds: ['STARRED'] } : { removeLabelIds: ['STARRED'] }
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages/${messageId}/modify`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to star message')
  }
}

export async function markGmailMessage(accessToken: string, messageId: string, markAsRead: boolean): Promise<void> {
  const body = markAsRead ? { removeLabelIds: ['UNREAD'] } : { addLabelIds: ['UNREAD'] }
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages/${messageId}/modify`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to mark message')
  }
}

// ─── Send / reply ─────────────────────────────────────────────

export async function sendGmailReply(accessToken: string, opts: ReplyOpts): Promise<void> {
  const subject = opts.subject.startsWith('Re:') ? opts.subject : `Re: ${opts.subject}`
  const refs    = [opts.references, opts.inReplyTo].filter(Boolean).join(' ')
  const raw = buildMimeRaw({
    from:          opts.from,
    to:            opts.to,
    subject,
    body:          opts.body,
    inReplyTo:     opts.inReplyTo,
    references:    refs || undefined,
    signatureHtml: opts.signatureHtml,
  })
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages/send`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ raw, threadId: opts.threadId }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to send reply')
  }
}

export async function sendGmailMessage(accessToken: string, opts: ComposeOpts): Promise<void> {
  const raw = buildMimeRaw({ from: opts.from, to: opts.to, subject: opts.subject, body: opts.body, signatureHtml: opts.signatureHtml })
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to send message')
  }
}

// ─── Send-as / drafts ─────────────────────────────────────────

export async function listSendAs(accessToken: string): Promise<GmailSendAs[]> {
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/settings/sendAs`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to list sendAs addresses')
  const items: Array<{ sendAsEmail: string; displayName?: string; isDefault?: boolean }> = data.sendAs ?? []
  return items.map(item => ({
    sendAsEmail: item.sendAsEmail,
    displayName: item.displayName ?? item.sendAsEmail,
    isDefault:   item.isDefault ?? false,
  }))
}

export async function listGmailDrafts(accessToken: string): Promise<GmailDraftSummary[]> {
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/drafts?maxResults=25`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to list drafts')
  const drafts: Array<{ id: string }> = data.drafts ?? []
  const results = await Promise.allSettled(
    drafts.map(draft =>
      fetch(
        `${GOOGLE_GMAIL_BASE}/users/me/drafts/${draft.id}?format=metadata&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      ).then(r => r.json()),
    ),
  )
  return results
    .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === 'fulfilled')
    .map(r => {
      const d = r.value
      const msg = (d.message as Record<string, unknown>) ?? {}
      const h = parseGmailHeaders(
        (msg.payload as { headers?: Array<{ name: string; value: string }> })?.headers ?? [],
      )
      return {
        draftId:   d.id as string,
        messageId: (msg.id as string) ?? '',
        threadId:  (msg.threadId as string) ?? '',
        snippet:   (msg.snippet as string) ?? '',
        date:      new Date(parseInt((msg.internalDate as string) ?? '0')).toISOString(),
        to:        h['to']      ?? '',
        subject:   h['subject'] ?? '(no subject)',
      }
    })
}

export async function createGmailDraft(
  accessToken: string,
  opts: ComposeOpts & { threadId?: string },
): Promise<{ draftId: string }> {
  const raw = buildMimeRaw({ from: opts.from, to: opts.to, subject: opts.subject, body: opts.body, signatureHtml: opts.signatureHtml })
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/drafts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { raw, ...(opts.threadId ? { threadId: opts.threadId } : {}) } }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to create draft')
  return { draftId: data.id as string }
}

export async function deleteGmailDraft(accessToken: string, draftId: string): Promise<void> {
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/drafts/${draftId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 404) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to delete draft')
  }
}
