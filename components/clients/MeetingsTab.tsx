'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { MeetingDetailRow } from './types'
import MeetingForm from '@/components/forms/MeetingForm'
import RowMenu from '@/components/shared/RowMenu'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import { getMeetingTypeConfig } from '@/lib/constants'

function safeDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export default function MeetingsTab({ meetings, clientId }: { meetings: MeetingDetailRow[]; clientId: string }) {
  const router = useRouter()
  const [showForm, setShowForm]           = useState(false)
  const [editMeeting, setEditMeeting]     = useState<MeetingDetailRow | null>(null)
  const [deleteMeeting, setDeleteMeeting] = useState<MeetingDetailRow | null>(null)
  const [expandedId, setExpandedId]       = useState<string | null>(null)

  const now = Date.now()
  const upcoming = meetings.filter(m => { const d = safeDate(m.date); return d && d.getTime() > now }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const past     = meetings.filter(m => { const d = safeDate(m.date); return !d || d.getTime() <= now }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleDelete = async () => {
    if (!deleteMeeting) return
    if (deleteMeeting.google_event_id) {
      fetch('/api/calendar/event', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleEventId: deleteMeeting.google_event_id }),
      }).catch(() => {})
    }
    await supabase.from('meetings').delete().eq('id', deleteMeeting.id)
    setDeleteMeeting(null)
    router.refresh()
  }

  return (
    <div>
      <MeetingForm isOpen={showForm} onClose={() => setShowForm(false)} prefillClientId={clientId} />
      {editMeeting && (
        <MeetingForm
          isOpen
          onClose={() => setEditMeeting(null)}
          initialData={{
            id: editMeeting.id, title: editMeeting.title, client_id: clientId,
            date: editMeeting.date, meeting_type: editMeeting.meeting_type,
            duration_minutes: editMeeting.duration_minutes, notes: editMeeting.notes,
            meeting_url: editMeeting.meeting_url,
          }}
        />
      )}
      <ConfirmDelete
        isOpen={!!deleteMeeting}
        onClose={() => setDeleteMeeting(null)}
        onConfirm={handleDelete}
        itemName={deleteMeeting?.title ?? ''}
        entityType="Meeting"
      />

      {meetings.length === 0 ? (
        <div style={{ border: '2px dashed rgba(222,191,191,0.5)', borderRadius: 8, padding: '40px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontStyle: 'italic', color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0 }}>No meetings yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {upcoming.length > 0 && (
            <section>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 10px 0' }}>Upcoming</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.map(m => <MeetingCard key={m.id} m={m} expandedId={expandedId} setExpandedId={setExpandedId} onEdit={() => setEditMeeting(m)} onDelete={() => setDeleteMeeting(m)} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 10px 0' }}>Past</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {past.map(m => <MeetingCard key={m.id} m={m} past expandedId={expandedId} setExpandedId={setExpandedId} onEdit={() => setEditMeeting(m)} onDelete={() => setDeleteMeeting(m)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function MeetingCard({ m, past = false, expandedId, setExpandedId, onEdit, onDelete }: {
  m: MeetingDetailRow; past?: boolean
  expandedId: string | null; setExpandedId: (id: string | null) => void
  onEdit: () => void; onDelete: () => void
}) {
  const d = new Date(m.date)
  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', opacity: past ? 0.75 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', color: '#1b1c1c' }}>
              {format(d, 'MMM d, yyyy · h:mm a')}
            </span>
            <span style={{ backgroundColor: '#F5E8EA', color: '#640015', fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {getMeetingTypeConfig(m.meeting_type).label}
            </span>
            {m.duration_minutes && (
              <span style={{ fontSize: 11, color: '#9c9490', fontFamily: 'var(--font-body)' }}>
                {m.duration_minutes} min
              </span>
            )}
          </div>
          {m.title && (
            <p style={{ fontSize: 13, color: '#574141', fontFamily: 'var(--font-body)', margin: 0 }}>{m.title}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
          {m.notes && (
            <button
              onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
              style={{ fontSize: 11, color: '#AB655C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              {expandedId === m.id ? 'Hide Notes ↑' : 'Notes →'}
            </button>
          )}
          <RowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      {expandedId === m.id && m.notes && (
        <p style={{ fontSize: 13, color: '#574141', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: '12px 0 0 0', borderTop: '1px solid #E8E0DC', paddingTop: 12, lineHeight: 1.6 }}>
          {m.notes}
        </p>
      )}
    </div>
  )
}
