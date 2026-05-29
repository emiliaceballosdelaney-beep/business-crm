'use client'

import { Star } from 'lucide-react'
import type { GmailMessageSummary } from '@/lib/google'
import type { InboxClient } from './InboxTab'
import { parseFromHeader } from './InboxReadingPane'

const AVATAR_COLORS = ['#640015', '#AB655C', '#8d4c44', '#574141', '#7a3030']
function avatarColor(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

interface Props {
  msg:         GmailMessageSummary
  isSelected:  boolean
  displayName: string
  client:      InboxClient | null
  labels:      string[]
  dateStr:     string
  onClick:     () => void
  onStar:      (e: React.MouseEvent) => void
}

export default function InboxMessageRow({ msg, isSelected, displayName, client, labels, dateStr, onClick, onStar }: Props) {
  const bg = avatarColor(displayName)
  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()} style={{ width: '100%', textAlign: 'left', padding: '12px 14px 12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', backgroundColor: isSelected ? '#fdf6f6' : 'transparent', borderBottom: '1px solid #f5eeed', borderLeft: isSelected ? '3px solid #640015' : '3px solid transparent', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.02em' }}>
        {initials(displayName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: msg.isUnread ? 700 : 500, color: '#1b1c1c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </span>
            {client && <span style={{ fontSize: 10, backgroundColor: '#f5e8ea', color: '#640015', borderRadius: 9999, padding: '1px 6px', fontWeight: 600, flexShrink: 0, fontFamily: 'var(--font-body)' }}>CRM</span>}
            {msg.isUnread && <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#640015', flexShrink: 0 }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginLeft: 8 }}>
            <button onClick={onStar} style={{ background: 'none', border: 'none', padding: '2px 3px', cursor: 'pointer', color: msg.isStarred ? '#c9760f' : '#c4b5b5', display: 'flex', alignItems: 'center' }}>
              <Star size={13} fill={msg.isStarred ? '#c9760f' : 'none'} />
            </button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#9c9490' }}>{dateStr}</span>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: msg.isUnread ? 600 : 400, color: '#1b1c1c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
          {msg.subject}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {msg.snippet}
        </div>
        {labels.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
            {labels.map(l => (
              <span key={l} style={{ fontSize: 10, backgroundColor: '#f5e8ea', color: '#8d4c44', borderRadius: 9999, padding: '1px 7px', fontWeight: 600, fontFamily: 'var(--font-body)' }}>{l}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
