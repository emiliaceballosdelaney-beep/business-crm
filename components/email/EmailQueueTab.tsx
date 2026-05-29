'use client'

import { useState } from 'react'
import type { QueueRow } from './EmailsPage'

const TEMPLATE_LABELS: Record<string, string> = {
  'discovery-invite':       'Discovery Invite',
  'intake-followup':        'Intake Follow-up',
  'post-discovery-thanks':  'Post-Discovery Thanks',
  'post-discovery-checkin': 'Post-Discovery Check-in',
  'idle-nudge':             'Idle Nudge',
}

const WORKFLOW_LABELS: Record<string, string> = {
  'new_lead_intake':  'New Lead Intake',
  'post_discovery':   'Post Discovery',
  'idle_nudge':       'Idle Nudge',
}

function formatSendAt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

interface Props {
  queue: QueueRow[]
  onCancel: (id: string) => void
}

export default function EmailQueueTab({ queue, onCancel }: Props) {
  const [cancelling, setCancelling] = useState<string | null>(null)

  async function handleCancel(id: string) {
    setCancelling(id)
    try {
      const res = await fetch(`/api/email/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancelled_reason: 'manual_cancel' }),
      })
      if (res.ok) {
        onCancel(id)
      }
    } finally {
      setCancelling(null)
    }
  }

  if (queue.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#9c9490', fontFamily: 'var(--font-body)', fontSize: 14 }}>
        No emails in queue
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
      {queue.map((row, i) => {
        const clientName = row.clients
          ? `${row.clients.first_name} ${row.clients.last_name}`
          : '—'
        const templateLabel = TEMPLATE_LABELS[row.template_key] ?? row.template_key
        const workflowLabel = WORKFLOW_LABELS[row.workflow_key] ?? row.workflow_key

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
                {templateLabel}
                <span style={{ color: '#9c9490', marginLeft: 6 }}>· {workflowLabel}</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#4D4D4D' }}>
                {formatSendAt(row.send_at)}
              </span>
              <button
                onClick={() => handleCancel(row.id)}
                disabled={cancelling === row.id}
                style={{
                  border: '1px solid #640015',
                  borderRadius: 6,
                  backgroundColor: 'transparent',
                  color: '#640015',
                  padding: '4px 10px',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  cursor: cancelling === row.id ? 'not-allowed' : 'pointer',
                  opacity: cancelling === row.id ? 0.5 : 1,
                }}
              >
                {cancelling === row.id ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
