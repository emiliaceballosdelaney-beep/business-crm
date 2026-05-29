'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Video, Phone } from 'lucide-react'
import type { MeetingRow } from '@/components/home/types'
import MeetingForm from '@/components/forms/MeetingForm'
import MeetingDetail from '@/components/meetings/MeetingDetail'
import type { MeetingRow as DetailMeetingRow } from '@/components/meetings/MeetingCard'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0].slice(0, 2) || '?').toUpperCase()
  return ((parts[0]?.[0] ?? '?') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

function formatType(type: string | null) {
  if (!type) return 'Meeting'
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function PlatformIcon({ url }: { url: string | null }) {
  if (!url) return null
  const isPhone = url.toLowerCase().includes('phone') || url.toLowerCase().includes('tel:')
  return isPhone
    ? <Phone size={14} color="#574141" strokeWidth={1.75} />
    : <Video size={14} color="#574141" strokeWidth={1.75} />
}

function toDetailRow(m: MeetingRow): DetailMeetingRow {
  return {
    id: m.id,
    title: m.title,
    date: m.date,
    duration_minutes: m.duration_minutes,
    meeting_type: m.meeting_type,
    notes: m.notes,
    status: m.status,
    meeting_url: m.meeting_url,
    google_event_id: m.google_event_id,
    source_calendar: m.source_calendar,
    client: m.client ? { id: m.client.id, name: m.client.name } : null,
  }
}

export default function HomeMeetingsSection({ meetings }: { meetings: MeetingRow[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<MeetingRow | null>(null)
  const [editing, setEditing] = useState<MeetingRow | null>(null)

  return (
    <div>
      {/* Add meeting form */}
      <MeetingForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      {/* Edit meeting form (opened from detail popup) */}
      {editing && (
        <MeetingForm
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          initialData={{
            id: editing.id,
            title: editing.title,
            client_id: editing.client?.id ?? null,
            date: editing.date,
            meeting_type: editing.meeting_type,
            duration_minutes: editing.duration_minutes,
            notes: editing.notes,
            meeting_url: editing.meeting_url,
            google_event_id: editing.google_event_id,
          }}
        />
      )}

      {/* Detail popup */}
      <MeetingDetail
        meeting={selected ? toDetailRow(selected) : null}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onEdit={(m) => {
          setSelected(null)
          const original = meetings.find(x => x.id === m.id) ?? null
          setEditing(original)
        }}
      />

      {/* Section heading */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, paddingLeft: 12, borderLeft: '2px solid #3d0009' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, color: '#1b1c1c', margin: 0 }}>
            Today&apos;s Meetings
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            style={{ backgroundColor: '#640015', color: 'white', fontSize: 12, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            + Add Meeting
          </button>
        </div>
      </div>

      {/* Cards container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: 'rgba(255,255,255,0.3)', border: '1px solid rgba(226,232,240,0.5)', borderRadius: 12, padding: 16 }}>
        {meetings.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 13, fontStyle: 'italic', color: '#574141', fontFamily: 'var(--font-body)', padding: '20px 0' }}>
            No meetings today
          </div>
        ) : (
          meetings.map((m) => {
            const client = Array.isArray(m.client) ? m.client[0] : m.client
            const name = client?.name ?? m.title
            const meetingTime = new Date(m.date)
            if (isNaN(meetingTime.getTime())) return null

            return (
              <div
                key={m.id}
                role="button"
                onClick={() => setSelected(m)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #debfbf',
                  borderTop: '2px solid #fecdd3',
                  borderRadius: 8,
                  padding: 24,
                  boxShadow: '0 4px 6px -1px rgba(100,0,21,0.05), 0 2px 4px -1px rgba(100,0,21,0.03)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Row 1: Avatar + name / Time pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#eae8e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: '#3d0009', flexShrink: 0 }}>
                        {initials(name)}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: '#1b1c1c', margin: 0 }}>
                        {name}
                      </h3>
                    </div>
                    <span style={{ backgroundColor: 'rgba(171,101,92,0.1)', color: '#8d4c44', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(222,191,191,0.3)', whiteSpace: 'nowrap' }}>
                      {format(meetingTime, 'h:mm a')}
                    </span>
                  </div>

                  {/* Row 2: Type text + badge */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#574141', letterSpacing: '0.05em' }}>
                      {m.title}
                    </span>
                    {m.meeting_type && (
                      <span style={{ padding: '2px 8px', borderRadius: 999, backgroundColor: 'rgba(255,179,180,0.2)', color: '#871e2b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', fontFamily: 'var(--font-body)' }}>
                        {formatType(m.meeting_type)}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Duration + platform */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#574141', fontFamily: 'var(--font-body)' }}>
                    <Clock size={16} color="#574141" strokeWidth={1.75} />
                    {m.duration_minutes && <span>{m.duration_minutes} min</span>}
                    {m.meeting_url && (
                      <>
                        <span style={{ margin: '0 2px' }}>•</span>
                        <PlatformIcon url={m.meeting_url} />
                        <span>{m.meeting_url.toLowerCase().includes('zoom') ? 'Zoom' : m.meeting_url.toLowerCase().includes('phone') ? 'Phone' : 'Video'}</span>
                      </>
                    )}
                  </div>

                  {/* Row 4: Agenda note */}
                  {m.notes && (
                    <p style={{ fontSize: 12, fontStyle: 'italic', fontFamily: 'var(--font-body)', color: 'rgba(87,65,65,0.7)', margin: 0 }}>
                      {m.notes}
                    </p>
                  )}

                  {/* Row 5: Join button */}
                  {m.meeting_url && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); window.open(m.meeting_url!, '_blank') }}
                        style={{ backgroundColor: '#3d0009', color: 'white', padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
                      >
                        Join
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
