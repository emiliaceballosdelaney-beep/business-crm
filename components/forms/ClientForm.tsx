'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID, PIPELINE_STAGES, SERVICE_TYPES } from '@/lib/constants'

interface InitialData {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  lead_stage: string
  service_type: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
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

export default function ClientForm({ isOpen, onClose, initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [stage, setStage]             = useState('lead')
  const [serviceType, setServiceType] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      setFirstName(initialData.first_name)
      setLastName(initialData.last_name)
      setEmail(initialData.email ?? '')
      setPhone(initialData.phone ?? '')
      setStage(initialData.lead_stage)
      setServiceType(initialData.service_type ?? '')
    } else {
      setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setStage('lead'); setServiceType('')
    }
    setError('')
  }, [isOpen])

  if (!isOpen) return null

  const reset = () => { setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setStage('lead'); setServiceType(''); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const first = firstName.trim()
    const last  = lastName.trim()
    const payload = {
      first_name: first,
      last_name:  last,
      name:       [first, last].filter(Boolean).join(' '),
      email:      email.trim() || null,
      phone:      phone.trim() || null,
      lead_stage: stage,
      service_type: stage === 'active' ? (serviceType || null) : null,
    }
    const { error: err } = isEdit
      ? await supabase.from('clients').update(payload).eq('id', initialData!.id)
      : await supabase.from('clients').insert({ ...payload, startup_id: PROSPER_STARTUP_ID })
    setLoading(false)
    if (err) { console.error('Client save error:', err.message, err.code, (err as any).details); setError(err.message); return }

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
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0, color: 'var(--foreground)' }}>
            {isEdit ? 'Edit Client' : 'Add Client'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={LABEL}>First Name *</label>
              <input style={INPUT} value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="First" disabled={loading} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={LABEL}>Last Name</label>
              <input style={INPUT} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last" disabled={loading} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Email</label>
            <input type="email" style={INPUT} value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.com" disabled={loading} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Phone</label>
            <input style={INPUT} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" disabled={loading} />
          </div>

          <div style={{ marginBottom: stage === 'active' ? 14 : 20 }}>
            <label style={LABEL}>Pipeline Stage</label>
            <select style={INPUT} value={stage} onChange={e => setStage(e.target.value)} disabled={loading}>
              {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {stage === 'active' && (
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Service Type</label>
              <select style={INPUT} value={serviceType} onChange={e => setServiceType(e.target.value)} disabled={loading}>
                <option value="">— None —</option>
                {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !firstName.trim()} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: '#F7F1ED', cursor: loading || !firstName.trim() ? 'not-allowed' : 'pointer', opacity: loading || !firstName.trim() ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
