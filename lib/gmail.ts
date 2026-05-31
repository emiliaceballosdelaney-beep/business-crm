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
  htmlBody:        string  // raw HTML for iframe rendering
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

const HTML_SIGNATURE = `<br><br><table cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:Arial,sans-serif;font-size:14px;color:#4D4D4D;padding:0;">--<br><img src="data:image/png;base64,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" alt="Prosper with Em" style="height:40px;width:auto;display:block;margin:8px 0 4px 16px;"><strong>Emilia Ceballos</strong><br><a href="https://prosperwithem.com" style="color:#640015;text-decoration:none;">prosperwithem.com</a></td></tr></table>`

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

export function extractHtmlBody(payload: Record<string, unknown>): string {
  const mimeType = payload?.mimeType as string | undefined
  const body     = payload?.body as { data?: string } | undefined
  const parts    = payload?.parts as Array<Record<string, unknown>> | undefined

  if (mimeType === 'text/html' && body?.data) return decodeBase64url(body.data)

  if (parts) {
    const html = parts.find(p => (p.mimeType as string) === 'text/html')
    if (html) { const b = html.body as { data?: string }; if (b?.data) return decodeBase64url(b.data) }
    for (const part of parts) {
      if (part.parts) { const nested = extractHtmlBody(part); if (nested) return nested }
    }
  }

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
    htmlBody:        extractHtmlBody(data.payload ?? {}),
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
        htmlBody:        extractHtmlBody((msg.payload as Record<string, unknown>) ?? {}),
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

export async function trashGmailMessage(accessToken: string, messageId: string): Promise<void> {
  const res = await fetch(`${GOOGLE_GMAIL_BASE}/users/me/messages/${messageId}/trash`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message ?? 'Failed to trash message')
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
