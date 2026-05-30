'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID, getMeetingTypeConfig } from '@/lib/constants'

interface InitialData {
  id: string
  title: string
  client_id: string | null
  date: string
  meeting_type: string | null
  duration_minutes: number | null
  notes: string | null
  meeting_url: string | null
  google_event_id?: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  prefillClientId?: string
  prefillDate?: string
  initialData?: InitialData
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

const MEETING_TYPES = [
  { value: 'discovery', label: 'Client Discovery Call' },
  { value: 'session',   label: 'Client Session' },
  { value: 'internal',  label: 'Business Meeting' },
  { value: 'personal',  label: 'Personal' },
  { value: 'holiday',   label: 'Holiday' },
]

export default function MeetingForm({ isOpen, onClose, prefillClientId, prefillDate, initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData
  const [clients, setClients]       = useState<{ id: string; name: string }[]>([])
  const [title, setTitle]           = useState('')
  const [clientId, setClientId]     = useState(prefillClientId ?? '')
  const [date, setDate]             = useState('')
  const [time, setTime]             = useState('10:00')
  const [type, setType]             = useState('session')
  const [duration, setDuration]     = useState('60')
  const [notes, setNotes]           = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!isOpen) return
    supabase.from('clients').select('id, name').eq('startup_id', PROSPER_STARTUP_ID).order('name')
      .then(({ data }) => setClients(data ?? []))
    if (initialData) {
      const d = new Date(initialData.date)
      setTitle(initialData.title)
      setClientId(initialData.client_id ?? '')
      setDate(d.toLocaleDateString('en-CA'))
      setTime(d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
      setType(initialData.meeting_type ?? 'session')
      setDuration(initialData.duration_minutes?.toString() ?? '60')
      setNotes(initialData.notes ?? '')
      setMeetingUrl(initialData.meeting_url ?? '')
    } else {
      setTitle(''); setClientId(prefillClientId ?? ''); setDate(prefillDate ?? ''); setTime('10:00')
      setType('session'); setDuration('60'); setNotes(''); setMeetingUrl('')
    }
    setError('')
  }, [isOpen])

  if (!isOpen) return null

  const reset = () => {
    setTitle(''); setClientId(prefillClientId ?? ''); setDate(''); setTime('10:00')
    setType('session'); setDuration('60'); setNotes(''); setMeetingUrl(''); setError('')
  }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const datetime = new Date(`${date}T${time}:00`).toISOString()
    const durationMinutes = duration ? parseInt(duration) : null
    const payload = {
      title: title.trim(),
      date: datetime,
      client_id: clientId || null,
      meeting_type: type,
      duration_minutes: durationMinutes,
      notes: notes.trim() || null,
      meeting_url: meetingUrl.trim() || null,
    }

    if (isEdit) {
      const { error: err } = await supabase.from('meetings').update(payload).eq('id', initialData!.id)
      if (err) { setLoading(false); setError(err.message); return }
      // Update Google Calendar event if one is linked
      if (initialData!.google_event_id) {
        fetch('/api/calendar/event', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleEventId: initialData!.google_event_id, title: payload.title, date: datetime, durationMinutes, notes: payload.notes }),
        }).catch(() => {})
      }
    } else {
      const { data: inserted, error: err } = await supabase
        .from('meetings')
        .insert({ ...payload, startup_id: PROSPER_STARTUP_ID, status: 'scheduled' })
        .select('id')
        .single()
      if (err) { setLoading(false); setError(err.message); return }
      if (inserted?.id) {
        // Push to Google Calendar (fire-and-forget)
        fetch('/api/calendar/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: inserted.id, title: payload.title, date: datetime, durationMinutes, notes: payload.notes }),
        }).catch(() => {})

        // Log a behind-the-scenes activity for client-linked meetings
        if (clientId) {
          const meetingLabel = getMeetingTypeConfig(type).label
          const meetingDate  = format(new Date(datetime), 'MMM d')
          supabase.from('interactions').insert({
            startup_id:       PROSPER_STARTUP_ID,
            client_id:        clientId,
            interaction_type: 'meeting_scheduled',
            title:            `Scheduled ${meetingLabel} · ${meetingDate}`,
            occurred_at:      new Date().toISOString(),
          }).then(() => {})
        }
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
        style={{ backgroundColor: 'var(--card)', borderRadius: 10, padding: 24, width: 480, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0, color: 'var(--foreground)' }}>
            {isEdit ? 'Edit Meeting' : 'Schedule Meeting'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Title *</label>
            <input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Monthly session with Sarah" disabled={loading} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Client</label>
            <select style={INPUT} value={clientId} onChange={e => setClientId(e.target.value)} disabled={loading}>
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Date *</label>
              <input type="date" style={INPUT} value={date} onChange={e => setDate(e.target.value)} required disabled={loading} />
            </div>
            <div>
              <label style={LABEL}>Time</label>
              <input type="time" style={INPUT} value={time} onChange={e => setTime(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Type</label>
              <select style={INPUT} value={type} onChange={e => setType(e.target.value)} disabled={loading}>
                {MEETING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Duration (min)</label>
              <input type="number" style={INPUT} value={duration} onChange={e => setDuration(e.target.value)} min={0} disabled={loading} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Meeting Link (Zoom, Meet, etc.)</label>
            <input style={INPUT} value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://zoom.us/j/…" disabled={loading} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Notes</label>
            <textarea style={{ ...INPUT, resize: 'vertical' } as React.CSSProperties} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Agenda, prep notes…" disabled={loading} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim() || !date} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: '#F7F1ED', cursor: loading || !title.trim() || !date ? 'not-allowed' : 'pointer', opacity: loading || !title.trim() || !date ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
