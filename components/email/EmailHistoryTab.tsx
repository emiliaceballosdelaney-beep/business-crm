'use client'

import type { HistoryRow } from './EmailsPage'

const TEMPLATE_LABELS: Record<string, string> = {
  'discovery-invite':       'Discovery Invite',
  'intake-followup':        'Intake Follow-up',
  'post-discovery-thanks':  'Post-Discovery Thanks',
  'post-discovery-checkin': 'Post-Discovery Check-in',
  'idle-nudge':             'Idle Nudge',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

interface Props {
  history: HistoryRow[]
}

export default function EmailHistoryTab({ history }: Props) {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#9c9490', fontFamily: 'var(--font-body)', fontSize: 14 }}>
        No emails sent yet
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #debfbf',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {history.map((row, i) => {
        const clientName = row.clients
          ? `${row.clients.first_name} ${row.clients.last_name}`
          : row.to_email
        const templateLabel = TEMPLATE_LABELS[row.template_key] ?? row.template_key

        return (
          <div
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: i === 0 ? 'none' : '1px solid #f0e8e8',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: '#1b1c1c' }}>
                {clientName}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#4D4D4D' }}>
                {row.subject}
                <span style={{ color: '#9c9490', marginLeft: 6 }}>· {templateLabel}</span>
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9c9490', whiteSpace: 'nowrap' }}>
              {formatDate(row.sent_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
