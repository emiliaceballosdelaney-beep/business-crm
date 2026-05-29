'use client'

import { useState } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { Trash2 } from 'lucide-react'
import type { GmailDraftSummary } from '@/lib/google'

interface Props {
  drafts:   GmailDraftSummary[]
  onSelect: (draft: GmailDraftSummary) => void
  onDelete: (draftId: string) => void
}

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (isToday(d))     return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export default function InboxDraftsList({ drafts, onSelect, onDelete }: Props) {
  const [hoveredId, setHoveredId]         = useState<string | null>(null)
  const [trashHoverId, setTrashHoverId]   = useState<string | null>(null)

  if (!drafts.length) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#9c9490' }}>
        No drafts
      </div>
    )
  }

  return (
    <div>
      {drafts.map(draft => (
        <div
          key={draft.draftId}
          onClick={() => onSelect(draft)}
          onMouseEnter={() => setHoveredId(draft.draftId)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f5eeed', backgroundColor: hoveredId === draft.draftId ? '#fdf6f6' : 'transparent' }}
        >
          {/* Draft pill */}
          <div style={{ flexShrink: 0 }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', borderRadius: 9999, padding: '1px 7px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
              Draft
            </span>
          </div>

          {/* Middle: subject + preview */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1b1c1c', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {draft.subject || '(no subject)'}
            </div>
            <div style={{ fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {draft.to ? `To: ${draft.to} · ` : ''}{draft.snippet}
            </div>
          </div>

          {/* Right: date + delete */}
          <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)' }}>
              {draft.date ? shortDate(draft.date) : ''}
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(draft.draftId) }}
              onMouseEnter={() => setTrashHoverId(draft.draftId)}
              onMouseLeave={() => setTrashHoverId(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: trashHoverId === draft.draftId ? '#AB655C' : '#debfbf' }}
              aria-label="Delete draft"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
