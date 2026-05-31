'use client'
import { useState, useEffect } from 'react'
import { X, Send, Save, Trash2, Loader2 } from 'lucide-react'
import ComposeForm from './ComposeForm'
import { useSignature } from '@/lib/useSignature'

interface Initial {
  to?:      string
  subject?: string
  body?:    string
  draftId?: string
}

interface Props {
  isOpen:   boolean
  onClose:  () => void
  initial?: Initial
}

const btnBase: React.CSSProperties = {
  borderRadius: 8, padding: '8px 16px',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
}

export default function ComposeModal({ isOpen, onClose, initial }: Props) {
  const [from,          setFrom]          = useState('')
  const [to,            setTo]            = useState('')
  const [subject,       setSubject]       = useState('')
  const [body,          setBody]          = useState('')
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [sending,       setSending]       = useState(false)
  const [savingDraft,   setSavingDraft]   = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTo(initial?.to ?? '')
      setSubject(initial?.subject ?? '')
      setBody(initial?.body ?? '')
      setActiveDraftId(initial?.draftId ?? null)
      setError(null)
    }
  }, [isOpen])

  const { text: sigText, signatureHtml, save: saveSig } = useSignature()
  const bodyText = body.replace(/<[^>]*>/g, '').trim()
  const canSend = !!from.trim() && !!to.trim() && !!subject.trim() && !!bodyText

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      if (activeDraftId) {
        await fetch(`/api/gmail/drafts?draftId=${activeDraftId}`, { method: 'DELETE' })
      }
      const res = await fetch('/api/gmail/drafts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, body, signatureHtml }),
      })
      const data = await res.json()
      if (data.draftId) setActiveDraftId(data.draftId)
    } catch {} finally { setSavingDraft(false) }
  }

  async function handleSend() {
    if (!canSend || sending) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/gmail/compose', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, body, signatureHtml }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to send') }
      if (activeDraftId) {
        await fetch(`/api/gmail/drafts?draftId=${activeDraftId}`, { method: 'DELETE' }).catch(() => {})
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send')
    } finally { setSending(false) }
  }

  async function handleDiscard() {
    if (activeDraftId) {
      await fetch(`/api/gmail/drafts?draftId=${activeDraftId}`, { method: 'DELETE' }).catch(() => {})
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      onClick={() => { if (!sending) onClose() }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(61,0,9,0.45)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(720px, 92vw)', maxHeight: '88vh', backgroundColor: 'white',
          borderRadius: 14, boxShadow: '0 20px 60px rgba(61,0,9,0.25)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #E8E0DC',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: 22,
            fontWeight: 600, color: '#3d0009', flex: 1,
          }}>
            New Message
          </span>
          <button
            onClick={() => { if (!sending) onClose() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', display: 'flex' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#640015' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9c9490' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 14px', color: '#991b1b',
              fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          <ComposeForm
            from={from} to={to} subject={subject} body={body} sigText={sigText}
            onFromChange={setFrom} onToChange={setTo}
            onSubjectChange={setSubject} onBodyChange={setBody} onSigSave={saveSig}
            disabled={sending}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #E8E0DC',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button
            onClick={handleDiscard}
            disabled={sending}
            style={{ ...btnBase, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: '#574141' }}
          >
            <Trash2 size={14} /> Discard
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleSaveDraft}
            disabled={sending || savingDraft}
            style={{ ...btnBase, border: '1px solid #debfbf', backgroundColor: 'transparent', color: '#640015' }}
          >
            {savingDraft ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {savingDraft ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            style={{ ...btnBase, backgroundColor: canSend ? '#640015' : '#c9a0a0', color: '#F7F1ED', border: 'none' }}
          >
            {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
