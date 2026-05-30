'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMeetingTypeConfig } from '@/lib/constants'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import type { MeetingRow } from './MeetingCard'

interface Props {
  meeting: MeetingRow | null
  isOpen: boolean
  onClose: () => void
  onEdit: (meeting: MeetingRow) => void
}

export default function MeetingDetail({ meeting, isOpen, onClose, onEdit }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!meeting) return null

  const tc = getMeetingTypeConfig(meeting.meeting_type)
  const meetingDate = new Date(meeting.date)
  const clientName = meeting.client?.name ?? meeting.title

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
    onClose()
    router.refresh()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ backgroundColor: tc.avatarBg, color: tc.avatarColor }}
              >
                {tc.abbrev}
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">{clientName}</DialogTitle>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold inline-block mt-0.5"
                  style={{ backgroundColor: tc.badgeBg, color: tc.badgeColor }}
                >
                  {tc.label}
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Details */}
          <div className="flex flex-col gap-3 text-[13px] font-body text-[#4D4D4D]">
            <Row label="Date & Time">
              {!isNaN(meetingDate.getTime()) ? format(meetingDate, 'EEEE, MMM d, yyyy · h:mm a') : '—'}
            </Row>
            {meeting.duration_minutes && (
              <Row label="Duration">{meeting.duration_minutes} min</Row>
            )}
            {meeting.client && (
              <Row label="Client">
                <a
                  href={`/clients/${meeting.client.id}`}
                  className="text-[#640015] underline"
                >
                  {meeting.client.name}
                </a>
              </Row>
            )}
            {meeting.status && (
              <Row label="Status">
                <span className="capitalize">{meeting.status}</span>
              </Row>
            )}
            {meeting.source_calendar && (
              <Row label="Calendar">{meeting.source_calendar}</Row>
            )}
            {meeting.notes && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#574141]/60 uppercase tracking-wider font-semibold">Notes</span>
                <p className="whitespace-pre-wrap text-[13px] text-[#4D4D4D] leading-relaxed bg-[#F7F1ED] rounded-lg p-3">
                  {meeting.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2 pt-4 border-t border-[#E8E0DC]">
            {meeting.meeting_url && (
              <button
                onClick={() => window.open(meeting.meeting_url!, '_blank')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-[#640015] text-[#640015] text-[12px] font-label hover:bg-[#640015] hover:text-white transition-colors"
              >
                <ExternalLink size={12} /> Join
              </button>
            )}
            <button
              onClick={() => onEdit(meeting)}
              className="px-4 py-1.5 rounded-md border border-[#640015] bg-[#640015] text-white text-[12px] font-label hover:bg-[#3d0009] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="ml-auto px-3 py-1.5 rounded-md text-[12px] font-label text-red-500 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>

          <ConfirmDelete
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            itemName={clientName}
            entityType="Meeting"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-[#574141]/60 uppercase tracking-wider font-semibold">{label}</span>
      <span>{children}</span>
    </div>
  )
}
