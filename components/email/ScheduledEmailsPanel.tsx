'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Mail, Clock, X } from 'lucide-react'

const TEMPLATE_LABELS: Record<string, string> = {
  'discovery-invite':        'Discovery invite + intake form',
  'intake-followup':         'Intake form follow-up',
  'post-discovery-thanks':   'Post-discovery thanks',
  'post-discovery-checkin':  'Post-discovery check-in',
  'idle-nudge':              'Re-engagement nudge',
}

type Row = {
  id: string
  template_key: string
  send_at: string
  status: string
}

export default function ScheduledEmailsPanel({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('scheduled_emails')
      .select('id, template_key, send_at, status')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('send_at', { ascending: true })
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }, [clientId])

  async function handleCancel(id: string) {
    await supabase
      .from('scheduled_emails')
      .update({ status: 'cancelled', cancelled_reason: 'manual_cancel' })
      .eq('id', id)
    setRows(prev => prev.filter(r => r.id !== id))
  }

  if (loading || rows.length === 0) return null

  return (
    <div style={section}>
      <div style={heading}>
        <Mail size={14} color="#640015" />
        <span style={headingText}>SCHEDULED EMAILS</span>
        <span style={badge}>{rows.length}</span>
      </div>
      <div style={list}>
        {rows.map(row => (
          <div key={row.id} style={item}>
            <div style={itemLeft}>
              <Clock size={13} color="#9c9490" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={templateName}>{TEMPLATE_LABELS[row.template_key] ?? row.template_key}</p>
                <p style={sendTime}>{format(new Date(row.send_at), 'MMM d, yyyy · h:mm a')}</p>
              </div>
            </div>
            <button onClick={() => handleCancel(row.id)} style={cancelBtn} title="Cancel this email">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const section: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #E8E0DC',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '24px',
}

const heading: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '14px',
}

const headingText: React.CSSProperties = {
  fontSize: '11px',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#640015',
}

const badge: React.CSSProperties = {
  backgroundColor: '#F7F1ED',
  border: '1px solid #debfbf',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#640015',
  padding: '1px 7px',
}

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' }

const item: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: '#fffaf8',
  border: '1px solid #E8E0DC',
  borderRadius: '8px',
  padding: '10px 12px',
}

const itemLeft: React.CSSProperties = { display: 'flex', gap: '8px', alignItems: 'flex-start' }

const templateName: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  color: '#1b1c1c',
  fontWeight: 500,
  margin: 0,
}

const sendTime: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'var(--font-body)',
  color: '#9c9490',
  margin: '2px 0 0',
}

const cancelBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#9c9490',
  padding: '2px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
}
