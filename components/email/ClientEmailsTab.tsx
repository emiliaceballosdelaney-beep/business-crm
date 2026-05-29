'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import IntakeResponsesCard from '@/components/email/IntakeResponsesCard'

const TEMPLATE_LABELS: Record<string, string> = {
  'discovery-invite':       'Discovery Invite',
  'intake-followup':        'Intake Follow-up',
  'post-discovery-thanks':  'Post-Discovery Thanks',
  'post-discovery-checkin': 'Post-Discovery Check-in',
  'idle-nudge':             'Idle Nudge',
}

type ScheduledRow = {
  id: string
  template_key: string
  send_at: string
  status: string
}

type SentRow = {
  id: string
  subject: string
  template_key: string
  sent_at: string
}

const sectionHeading: React.CSSProperties = {
  borderLeft: '2px solid #3d0009',
  fontFamily: 'var(--font-heading)',
  fontSize: 16,
  fontWeight: 500,
  color: '#1b1c1c',
  paddingLeft: 8,
  marginBottom: 12,
  margin: '0 0 12px 0',
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #debfbf',
  borderRadius: 12,
  padding: 16,
}

const emptyText: React.CSSProperties = {
  fontSize: 13,
  fontStyle: 'italic',
  color: '#9c9490',
  fontFamily: 'var(--font-body)',
  margin: 0,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #f3eded',
}

const cancelBtnStyle: React.CSSProperties = {
  border: '1px solid #640015',
  color: '#640015',
  borderRadius: 6,
  padding: '2px 10px',
  fontSize: 13,
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  flexShrink: 0,
}

export default function ClientEmailsTab({ clientId }: { clientId: string }) {
  const [scheduled, setScheduled] = useState<ScheduledRow[]>([])
  const [sent, setSent] = useState<SentRow[]>([])
  const [scheduledLoading, setScheduledLoading] = useState(true)
  const [sentLoading, setSentLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('scheduled_emails')
      .select('id, template_key, send_at, status')
      .eq('client_id', clientId)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .eq('status', 'pending')
      .order('send_at', { ascending: true })
      .then(({ data }) => {
        setScheduled(data ?? [])
        setScheduledLoading(false)
      })

    supabase
      .from('email_log')
      .select('id, subject, template_key, sent_at')
      .eq('client_id', clientId)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('sent_at', { ascending: false })
      .then(({ data }) => {
        setSent(data ?? [])
        setSentLoading(false)
      })
  }, [clientId])

  async function handleCancel(id: string) {
    const res = await fetch(`/api/email/queue/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', cancelled_reason: 'manual_cancel' }),
    })
    if (res.ok) {
      setScheduled(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Section 1 — Scheduled Emails */}
      <div>
        <h2 style={sectionHeading}>Scheduled Emails</h2>
        {scheduledLoading ? null : scheduled.length === 0 ? (
          <p style={emptyText}>No emails scheduled</p>
        ) : (
          <div style={card}>
            {scheduled.map((row, i) => (
              <div
                key={row.id}
                style={{
                  ...rowStyle,
                  borderBottom: i === scheduled.length - 1 ? 'none' : rowStyle.borderBottom,
                }}
              >
                <div style={{ fontFamily: 'var(--font-body)' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1b1c1c', margin: '0 0 2px 0' }}>
                    {TEMPLATE_LABELS[row.template_key] ?? row.template_key}
                  </p>
                  <p style={{ fontSize: 12, color: '#9c9490', margin: 0 }}>
                    {format(new Date(row.send_at), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <button onClick={() => handleCancel(row.id)} style={cancelBtnStyle}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2 — Sent History */}
      <div>
        <h2 style={sectionHeading}>Sent Emails</h2>
        {sentLoading ? null : sent.length === 0 ? (
          <p style={emptyText}>No emails sent yet</p>
        ) : (
          <div style={card}>
            {sent.map((row, i) => (
              <div
                key={row.id}
                style={{
                  ...rowStyle,
                  borderBottom: i === sent.length - 1 ? 'none' : rowStyle.borderBottom,
                }}
              >
                <div style={{ fontFamily: 'var(--font-body)' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1b1c1c', margin: '0 0 2px 0' }}>
                    {row.subject}
                  </p>
                  <p style={{ fontSize: 11, color: '#9c9490', margin: 0 }}>
                    {TEMPLATE_LABELS[row.template_key] ?? row.template_key}
                    {' · '}
                    {format(new Date(row.sent_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3 — Intake Form Response */}
      <div>
        <h2 style={sectionHeading}>Intake Form Response</h2>
        <IntakeResponsesCard clientId={clientId} />
      </div>

    </div>
  )
}
