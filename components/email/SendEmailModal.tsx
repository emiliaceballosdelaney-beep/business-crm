'use client'

import { useState, useEffect } from 'react'

type Client = {
  id: string
  first_name: string
  last_name: string | null
}

type Template = {
  key: string
  label: string
  trigger: string
  preview: string
}

const TEMPLATES: Template[] = [
  {
    key: 'discovery-invite',
    label: 'Discovery Invite',
    trigger: 'new_lead_intake — step 1',
    preview: `Hi [First Name]! I'm so excited to connect with you. Before we meet, I'd love to learn a little more about you — it helps me make our time together as useful as possible. I put together a short intake form. It takes about 5 minutes and makes a huge difference in how prepared I can be for our call. [Intake form button] Haven't booked your discovery call yet? Grab a time here. Looking forward to chatting! Em ✨`,
  },
  {
    key: 'intake-followup',
    label: 'Intake Follow-up',
    trigger: 'new_lead_intake — step 2 (72h later)',
    preview: `Hey [First Name]! Just a friendly nudge — your intake form is still waiting for you! It only takes about 5 minutes and it genuinely helps me show up prepared for our call. The more I know about you ahead of time, the more useful I can be. [Complete intake form button] No pressure at all — just wanted to make sure it didn't get lost in your inbox! Talk soon, Em ✨`,
  },
  {
    key: 'post-discovery-thanks',
    label: 'Post-Discovery Thanks',
    trigger: 'post_discovery — step 1 (24h after discovery call)',
    preview: `It was so great meeting you, [First Name]! Thank you for taking the time to connect today. I really loved learning about you and what you're working toward — it was such a genuine conversation. I'm already thinking about how I can support you on this journey. You deserve to feel confident and in control of your financial life, and I truly believe we could do some meaningful work together. No action needed from you right now — I just wanted to say it was wonderful meeting you and I'm rooting for you either way. With warmth, Em 💛`,
  },
  {
    key: 'post-discovery-checkin',
    label: 'Post-Discovery Check-in',
    trigger: 'post_discovery — step 2 (5 days after discovery call)',
    preview: `Hey [First Name] 👋 I know life gets busy, so I just wanted to check in and see if you have any questions about working together. If something held you back or you'd like to talk through what coaching would look like for your situation, I'm genuinely happy to chat — no obligation at all. And if the timing just isn't right, that's completely okay too. I'll be here when you're ready. [Let's reconnect button] Wishing you the best, Em ✨`,
  },
  {
    key: 'idle-nudge',
    label: 'Idle Nudge',
    trigger: 'idle_nudge — auto-detected (14+ days no contact)',
    preview: `Hey [First Name] 💛 It's been a little while since we connected, and I just wanted to check in. If you're still thinking about working on your finances — whether that's paying off debt, starting to invest, or just feeling less stressed about money — I'm here and would genuinely love to help. No pressure at all. I just didn't want you to feel like you were forgotten. 🌸 [Book a free call button] With warmth, Em ✨`,
  },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  prefillClientId?: string
  prefillTemplateKey?: string
}

export default function SendEmailModal({ isOpen, onClose, prefillClientId, prefillTemplateKey }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(prefillClientId ?? '')
  const [templateKey, setTemplateKey] = useState(prefillTemplateKey ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => setClients(data.clients ?? []))
      .catch(() => {})
  }, [isOpen])

  // Sync prefill props when they change
  useEffect(() => { setClientId(prefillClientId ?? '') }, [prefillClientId])
  useEffect(() => { setTemplateKey(prefillTemplateKey ?? '') }, [prefillTemplateKey])

  if (!isOpen) return null

  const selectedTemplate = TEMPLATES.find(t => t.key === templateKey) ?? null

  const handleSend = async () => {
    setError('')
    if (!clientId) { setError('Please select a client.'); return }
    if (!templateKey) { setError('Please select a template.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, templateKey }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error ?? 'Send failed. Please try again.')
      } else {
        setSent(true)
        setTimeout(() => { setSent(false); onClose() }, 1500)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSent(false)
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
      onClick={handleClose}
    >
      <div
        style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #debfbf', padding: 24, width: '100%', maxWidth: 448, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 400, color: '#3d0009', margin: 0 }}>
            Send Email
          </h2>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', fontSize: 20, lineHeight: 1, padding: 4 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Client dropdown */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Client
          </span>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #debfbf', fontFamily: 'var(--font-body)', fontSize: 14, color: '#1b1c1c', backgroundColor: '#fff' }}
          >
            <option value="">Select a client…</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name}{c.last_name ? ` ${c.last_name}` : ''}
              </option>
            ))}
          </select>
        </label>

        {/* Template dropdown */}
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Template
          </span>
          <select
            value={templateKey}
            onChange={e => setTemplateKey(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #debfbf', fontFamily: 'var(--font-body)', fontSize: 14, color: '#1b1c1c', backgroundColor: '#fff' }}
          >
            <option value="">Select a template…</option>
            {TEMPLATES.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          {selectedTemplate && (
            <p style={{ margin: '4px 0 0', fontSize: 11, fontFamily: 'var(--font-body)', color: '#9c9490' }}>
              {selectedTemplate.trigger}
            </p>
          )}
        </label>

        {/* Preview */}
        {selectedTemplate && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Preview
            </span>
            <div style={{ backgroundColor: '#F7F1ED', borderRadius: 8, padding: '10px 12px', maxHeight: 160, overflowY: 'auto' }}>
              <p style={{ margin: 0, fontSize: 14, fontFamily: 'var(--font-body)', color: '#4D4D4D', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedTemplate.preview}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ margin: '0 0 12px', fontSize: 13, fontFamily: 'var(--font-body)', color: '#B91C1C' }}>
            {error}
          </p>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading || sent}
          style={{ width: '100%', backgroundColor: '#640015', color: '#F7F1ED', borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading || sent ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 8 }}
        >
          {sent ? 'Sent!' : loading ? 'Sending…' : 'Send Now'}
        </button>

        {/* Cancel */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', color: '#9c9490', textDecoration: 'underline' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
