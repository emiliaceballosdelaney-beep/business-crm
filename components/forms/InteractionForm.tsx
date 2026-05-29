'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID, INTERACTION_TYPES, DIRECT_CONTACT_TYPES } from '@/lib/constants'

interface Props {
  isOpen: boolean
  onClose: () => void
  clientId: string
}

const INPUT = {
  fontSize: 13, fontFamily: 'var(--font-body)',
  padding: '7px 10px', borderRadius: 6,
  border: '1px solid #E8E0DC', backgroundColor: 'var(--background)',
  color: 'var(--foreground)', width: '100%', outline: 'none',
} as const

const LABEL = {
  fontSize: 12, fontFamily: 'var(--font-body)',
  color: 'var(--muted-foreground)', display: 'block', marginBottom: 4,
} as const


export default function InteractionForm({ isOpen, onClose, clientId }: Props) {
  const router = useRouter()
  const [type, setType]       = useState('note')
  const [title, setTitle]     = useState('')
  const [body, setBody]       = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  if (!isOpen) return null

  const reset = () => { setType('note'); setTitle(''); setBody(''); setDate(new Date().toISOString().split('T')[0]); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const occurredAt = new Date(date + 'T00:00:00').toISOString()
    const { error: err } = await supabase.from('interactions').insert({
      startup_id: PROSPER_STARTUP_ID,
      client_id: clientId,
      interaction_type: type,
      title: title.trim(),
      body: body.trim() || null,
      occurred_at: occurredAt,
    })
    if (err) { setLoading(false); setError(err.message); return }

    // Only direct contact types update last_contacted_at; notes are behind-the-scenes
    if ((DIRECT_CONTACT_TYPES as readonly string[]).includes(type)) {
      const { data: latest } = await supabase
        .from('interactions')
        .select('occurred_at')
        .eq('client_id', clientId)
        .in('interaction_type', [...DIRECT_CONTACT_TYPES])
        .order('occurred_at', { ascending: false })
        .limit(1)
        .single()
      if (latest) {
        await supabase.from('clients').update({ last_contacted_at: latest.occurred_at }).eq('id', clientId)
      }
    }
    setLoading(false)
    reset()
    onClose()
    router.refresh()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={handleClose}
    >
      <div
        style={{ backgroundColor: 'var(--card)', borderRadius: 10, padding: 24, width: 440, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0, color: 'var(--foreground)' }}>Log Interaction</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Type</label>
              <select style={INPUT} value={type} onChange={e => setType(e.target.value)} disabled={loading}>
                {INTERACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Date</label>
              <input type="date" style={INPUT} value={date} onChange={e => setDate(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Title *</label>
            <input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Check-in call, Sent budget template" disabled={loading} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Notes</label>
            <textarea style={{ ...INPUT, resize: 'vertical' } as React.CSSProperties} rows={3} value={body} onChange={e => setBody(e.target.value)} placeholder="What was discussed or covered?" disabled={loading} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: '#F7F1ED', cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading || !title.trim() ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {loading ? 'Saving…' : 'Log Interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
