'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMeetingTypeConfig } from '@/lib/constants'
import RowMenu from '@/components/shared/RowMenu'
import MeetingForm from '@/components/forms/MeetingForm'
import ConfirmDelete from '@/components/modals/ConfirmDelete'

export type MeetingRow = {
  id: string
  title: string
  date: string
  duration_minutes: number | null
  meeting_type: string | null
  notes: string | null
  status: string
  meeting_url: string | null
  google_event_id: string | null
  source_calendar: string | null
  client: { id: string; name: string } | null
}

export { getMeetingTypeConfig as getTypeConfig } from '@/lib/constants'

function NotesWithLinks({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#640015', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

interface Props {
  meeting: MeetingRow
  past?: boolean
  onSelect?: (m: MeetingRow) => void
}

export default function MeetingCard({ meeting, past = false, onSelect }: Props) {
  const router = useRouter()
  const [expanded, setExpanded]     = useState(false)
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const clientName = meeting.client?.name ?? meeting.title
  const typeConfig = getMeetingTypeConfig(meeting.meeting_type)
  const meetingDate = new Date(meeting.date)
  if (isNaN(meetingDate.getTime())) return null

  const handleDelete = async () => {
    if (meeting.google_event_id) {
      await fetch('/api/calendar/event', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleEventId: meeting.google_event_id,
          sourceCalendarName: meeting.source_calendar,
        }),
      }).catch(() => {}) // best-effort; CRM delete proceeds regardless
    }
    await supabase.from('meetings').delete().eq('id', meeting.id)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <div
      role="button"
      onClick={() => onSelect?.(meeting)}
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid #E8E0DC',
        borderRadius: 10,
        padding: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      <MeetingForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{
          id: meeting.id,
          title: meeting.title,
          client_id: meeting.client?.id ?? null,
          date: meeting.date,
          meeting_type: meeting.meeting_type,
          duration_minutes: meeting.duration_minutes,
          notes: meeting.notes,
          meeting_url: meeting.meeting_url,
          google_event_id: meeting.google_event_id,
        }}
      />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={clientName}
        entityType="Meeting"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Type avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          backgroundColor: typeConfig.avatarBg, color: typeConfig.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
        }}>
          {typeConfig.abbrev}
        </div>

        {/* Middle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--foreground)', margin: '0 0 3px 0' }}>
            {clientName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ backgroundColor: typeConfig.badgeBg, color: typeConfig.badgeColor, fontSize: 10, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {typeConfig.label}
            </span>
            {meeting.duration_minutes && (
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-body)' }}>
                · {meeting.duration_minutes} min
              </span>
            )}
            {meeting.source_calendar && (
              <span style={{ fontSize: 10, color: '#9c9490', fontFamily: 'var(--font-body)' }}>
                · 📅 {meeting.source_calendar}
              </span>
            )}
          </div>
          {!past && meeting.notes && (
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic', fontFamily: 'var(--font-body)', margin: '4px 0 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {meeting.notes}
            </p>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
            {format(meetingDate, 'EEE, MMM d · h:mm a')}
          </span>
          {past ? (
            meeting.notes ? (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
                style={{ fontSize: 11, color: '#AB655C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}
              >
                {expanded ? 'Hide Notes ↑' : 'View Notes →'}
              </button>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-body)' }}>No notes</span>
            )
          ) : (
            <button
              onClick={e => { e.stopPropagation(); if (meeting.meeting_url) window.open(meeting.meeting_url, '_blank') }}
              disabled={!meeting.meeting_url}
              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, border: '1px solid #640015', backgroundColor: 'transparent', color: meeting.meeting_url ? '#640015' : 'var(--muted-foreground)', cursor: meeting.meeting_url ? 'pointer' : 'default', fontFamily: 'var(--font-body)', opacity: meeting.meeting_url ? 1 : 0.5 }}
            >
              Join
            </button>
          )}
        </div>

        <div onClick={e => e.stopPropagation()}>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      {/* Expanded notes */}
      {expanded && meeting.notes && (
        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'var(--font-body)', margin: '10px 0 0 0', borderTop: '1px solid #E8E0DC', paddingTop: 10, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          <NotesWithLinks text={meeting.notes} />
        </p>
      )}
    </div>
  )
}
