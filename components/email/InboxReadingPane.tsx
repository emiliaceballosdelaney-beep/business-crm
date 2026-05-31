'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Archive, Trash2, Mail, MailOpen, Reply, Loader2, Send } from 'lucide-react'
import type { GmailMessageSummary, GmailMessageFull } from '@/lib/google'
import type { InboxClient } from './InboxTab'
import InboxTagEditor from './InboxTagEditor'
import SendAsDropdown from './SendAsDropdown'
import InboxThreadView from './InboxThreadView'
import RichTextEditor from './RichTextEditor'
import SignatureEditor from './SignatureEditor'
import { useSignature } from '@/lib/useSignature'

interface Props {
  selected:        GmailMessageSummary
  fullMessage:     GmailMessageFull | null
  bodyLoading:     boolean
  matchedClient:   InboxClient | null
  isLogged:        boolean
  logging:         boolean
  labels:          string[]
  savingLabels:    boolean
  thread:          GmailMessageFull[] | null
  onLog:           () => void
  onArchive:       () => void
  onTrash:         () => void
  onToggleRead:    () => void
  onUpdateLabels:  (labels: string[]) => void
}

function avatarColor(name: string): string {
  const COLORS = ['#640015', '#AB655C', '#8d4c44', '#574141', '#7a3030']
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export function parseFromHeader(from: string): { name: string; email: string } {
  const m = from.match(/^(.*?)\s*<([^>]+)>$/)
  if (m) return { name: m[1].trim() || m[2], email: m[2].trim() }
  return { name: from, email: from }
}


const TOOLBAR_BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'transparent', border: '1px solid #E8E0DC',
  borderRadius: 6, padding: '5px 11px', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, color: '#574141',
}

const REPLY_BTN: React.CSSProperties = {
  ...TOOLBAR_BTN,
  backgroundColor: '#640015', color: '#F7F1ED', border: 'none',
}

export default function InboxReadingPane({
  selected, fullMessage, bodyLoading, matchedClient,
  isLogged, logging, labels, savingLabels, thread,
  onLog, onArchive, onTrash, onToggleRead, onUpdateLabels,
}: Props) {
  const { text: sigText, signatureHtml, save: saveSig } = useSignature()
  const [replyOpen, setReplyOpen]       = useState(false)
  const [replyBody, setReplyBody]       = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sending, setSending]           = useState(false)
  const [replySent, setReplySent]       = useState(false)
  const [fromAddr, setFromAddr]         = useState('')

  // Reset compose when switching messages
  useEffect(() => {
    setReplyOpen(false)
    setReplyBody('')
    setReplySent(false)
    const sub = selected.subject
    setReplySubject(sub.toLowerCase().startsWith('re:') ? sub : `Re: ${sub}`)
  }, [selected.id, selected.subject])

  const { name: senderName, email: senderEmail } = parseFromHeader(selected.from)
  const avatarBg = avatarColor(senderName)

  async function handleSendReply() {
    const bodyText = replyBody.replace(/<[^>]*>/g, '').trim()
    if (!bodyText || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/gmail/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:            selected.from,
          subject:       replySubject,
          body:          replyBody,
          threadId:      selected.threadId,
          inReplyTo:     fullMessage?.emailMessageId,
          references:    fullMessage?.emailReferences,
          from:          fromAddr || undefined,
          signatureHtml,
        }),
      })
      if (res.ok) {
        setReplySent(true)
        setReplyBody('')
        setReplyOpen(false)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderBottom: '1px solid #f0e8e8', backgroundColor: '#fdfaf9', flexShrink: 0 }}>
        <button style={TOOLBAR_BTN} onClick={onArchive}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#debfbf')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#E8E0DC')}
        >
          <Archive size={14} /> Archive
        </button>
        <button style={TOOLBAR_BTN} onClick={onTrash}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#debfbf')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#E8E0DC')}
        >
          <Trash2 size={14} /> Delete
        </button>
        <button style={TOOLBAR_BTN} onClick={onToggleRead}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#debfbf')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#E8E0DC')}
        >
          {selected.isUnread ? <MailOpen size={14} /> : <Mail size={14} />}
          {selected.isUnread ? 'Mark read' : 'Mark unread'}
        </button>
        <div style={{ flex: 1 }} />
        <button style={REPLY_BTN} onClick={() => setReplyOpen(o => !o)}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3d0009')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#640015')}
        >
          <Reply size={14} /> Reply
        </button>
      </div>

      {/* Subject */}
      <div style={{ padding: '20px 28px 0', flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: '#3d0009', margin: '0 0 4px', lineHeight: 1.3 }}>
          {selected.subject}
        </h2>
      </div>

      {/* Tags */}
      <div style={{ padding: '10px 28px', borderBottom: '1px solid #f0e8e8', flexShrink: 0 }}>
        <InboxTagEditor labels={labels} onChange={onUpdateLabels} saving={savingLabels} />
      </div>

      {/* Thread or single message header + body */}
      {thread && thread.length > 1 ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <InboxThreadView thread={thread} selectedId={selected.id} matchedClient={matchedClient} />
        </div>
      ) : (
        <>
          {/* Single message header */}
          <div style={{ padding: '16px 28px', borderBottom: '1px solid #f0e8e8', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: avatarBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'white' }}>
                {initials(senderName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#1b1c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {senderName}
                  {matchedClient && (
                    <span style={{ fontSize: 11, backgroundColor: '#f5e8ea', color: '#640015', borderRadius: 9999, padding: '1px 7px', fontWeight: 600 }}>
                      CRM
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490' }}>{senderEmail}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#574141' }}>{format(new Date(selected.date), 'MMM d, yyyy')}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490' }}>{format(new Date(selected.date), 'h:mm a')}</div>
              </div>
            </div>
          </div>
          {/* Single message body */}
          <div style={{ flex: 1, padding: '24px 28px' }}>
            {bodyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                <Loader2 size={20} style={{ color: '#AB655C', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : fullMessage?.htmlBody ? (
              <iframe
                srcDoc={fullMessage.htmlBody}
                sandbox="allow-same-origin allow-popups"
                title="email-body"
                style={{ width: '100%', border: 'none', minHeight: 300, display: 'block' }}
                onLoad={e => {
                  const f = e.currentTarget
                  if (f.contentDocument?.body) f.style.height = `${f.contentDocument.body.scrollHeight + 32}px`
                }}
              />
            ) : (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.85, color: '#4D4D4D', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {fullMessage?.body || selected.snippet}
              </div>
            )}
          </div>
        </>
      )}

      {/* Log to CRM */}
      {matchedClient && !bodyLoading && (
        <div style={{ padding: '0 28px 16px', flexShrink: 0 }}>
          <div style={{ paddingTop: 18, borderTop: '1px solid #f0e8e8' }}>
            {isLogged ? (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#6b7280' }}>
                ✓ Logged to {matchedClient.first_name}&apos;s activity
              </span>
            ) : (
              <button onClick={onLog} disabled={logging} style={{ border: '1px solid #640015', backgroundColor: 'transparent', color: '#640015', borderRadius: 6, padding: '6px 14px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: logging ? 'not-allowed' : 'pointer', opacity: logging ? 0.6 : 1 }}>
                {logging ? 'Logging…' : `Log to ${matchedClient.first_name}'s CRM`}
              </button>
            )}
          </div>
        </div>
      )}

      {replySent && (
        <div style={{ margin: '0 28px 16px', padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534', flexShrink: 0 }}>
          ✓ Reply sent
        </div>
      )}

      {/* Reply compose */}
      {replyOpen && (
        <div style={{ borderTop: '1px solid #f0e8e8', padding: '16px 28px', backgroundColor: '#fdfaf9', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490', marginBottom: 10 }}>
            Replying to {senderEmail}
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490', marginBottom: 4 }}>From</div>
            <SendAsDropdown value={fromAddr} onChange={setFromAddr} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490', marginBottom: 4 }}>Subject</div>
            <input
              value={replySubject}
              onChange={e => setReplySubject(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: 14, color: '#1b1c1c', backgroundColor: 'white', border: '1px solid #debfbf', borderRadius: 8, padding: '8px 14px', outline: 'none' }}
            />
          </div>
          <RichTextEditor content={replyBody} onChange={setReplyBody} placeholder="Write a reply…" minHeight={120} />
          <SignatureEditor text={sigText} onSave={saveSig} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { setReplyOpen(false); setReplyBody('') }} style={{ border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: '#574141', borderRadius: 6, padding: '7px 14px', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSendReply} disabled={!replyBody.replace(/<[^>]*>/g, '').trim() || sending} style={{ backgroundColor: (!replyBody.trim() || sending) ? '#c9a0a0' : '#640015', color: '#F7F1ED', border: 'none', borderRadius: 6, padding: '7px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: (!replyBody.trim() || sending) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
