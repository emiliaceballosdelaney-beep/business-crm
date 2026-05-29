'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { ClientRow, NextMeeting } from './types'
import RowMenu from '@/components/shared/RowMenu'
import ClientForm from '@/components/forms/ClientForm'
import InteractionForm from '@/components/forms/InteractionForm'
import ConfirmDelete from '@/components/modals/ConfirmDelete'

function safeDate(s: string | null): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function attentionDot(lastContacted: string | null, updatedAt: string) {
  const ref = safeDate(lastContacted) ?? safeDate(updatedAt) ?? new Date()
  const days = Math.floor((Date.now() - ref.getTime()) / 86400000)
  if (days <= 7) return '#4CAF50'
  if (days <= 14) return '#F59E0B'
  return '#DC2626'
}

function formatMeetingType(type: string | null): string {
  if (!type) return 'Meeting'
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

interface Props {
  client: ClientRow
  nextMeeting?: NextMeeting
}

export default function ClientCard({ client, nextMeeting }: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [logOpen, setLogOpen]       = useState(false)

  const dotColor = attentionDot(client.last_contacted, client.updated_at)
  const showServicePill = client.lead_stage === 'active' && client.service_type

  const lastContactDate = client.last_contacted ? format(new Date(client.last_contacted), 'MMM d') : '—'

  const handleDelete = async () => {
    await supabase.from('clients').delete().eq('id', client.id)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <div
      onClick={() => router.push(`/clients/${client.id}`)}
      style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(100,0,21,0.05), 0 2px 4px -1px rgba(100,0,21,0.03)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}
    >
      <ClientForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: client.id, first_name: client.first_name, last_name: client.last_name, email: client.email, phone: client.phone, lead_stage: client.lead_stage, service_type: client.service_type }}
      />
      <InteractionForm isOpen={logOpen} onClose={() => setLogOpen(false)} clientId={client.id} />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={client.name}
        entityType="Client"
      />

      {/* Name + menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', color: '#1b1c1c' }}>
          {client.name}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      {/* Service type pill (Active clients only) */}
      {showServicePill && (
        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(255,172,161,0.2)', color: '#640015', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-body)', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
          {client.service_type}
        </span>
      )}

      {/* Last contact + attention dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block', flexShrink: 0 }} />
        <p style={{ fontSize: 14, color: '#574141', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
          Last contact: {lastContactDate}
        </p>
      </div>

      {/* Next meeting */}
      {nextMeeting && safeDate(nextMeeting.date) && (
        <p style={{ fontSize: 12, color: '#574141', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: 0 }}>
          Next: {format(safeDate(nextMeeting.date)!, 'MMM d')} · {formatMeetingType(nextMeeting.meeting_type)}
        </p>
      )}

      {/* Action links */}
      <div onClick={(e) => e.stopPropagation()} style={{ borderTop: '1px solid rgba(222,191,191,0.3)', paddingTop: 8 }}>
        <button onClick={() => setLogOpen(true)} style={{ fontSize: 12, color: '#8d4c44', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
          Log Interaction
        </button>
      </div>
    </div>
  )
}
