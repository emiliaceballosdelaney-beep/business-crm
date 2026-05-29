'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { GmailMessageFull } from '@/lib/google'
import type { InboxClient } from './InboxTab'

interface Props {
  thread:        GmailMessageFull[]
  selectedId:    string
  matchedClient: InboxClient | null
}

function avatarColor(name: string): string {
  const COLORS = ['#640015', '#AB655C', '#8d4c44', '#574141', '#7a3030']
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function parseSender(from: string): { name: string; email: string } {
  const m = from.match(/^(.*?)\s*<([^>]+)>$/)
  if (m) return { name: m[1].trim() || m[2], email: m[2].trim() }
  return { name: from, email: from }
}

export default function InboxThreadView({ thread, selectedId, matchedClient }: Props) {
  const newestId = thread[thread.length - 1]?.id ?? ''
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([selectedId, newestId].filter(Boolean))
  )

  function toggleExpand(id: string) {
    if (id === newestId) return // never collapse newest
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      {thread.map(msg => {
        const { name: senderName, email: senderEmail } = parseSender(msg.from)
        const bg = avatarColor(senderName)
        const expanded = expandedIds.has(msg.id)

        if (!expanded) {
          return (
            <div
              key={msg.id}
              onClick={() => toggleExpand(msg.id)}
              style={{ borderTop: '1px solid #f0e8e8', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'white' }}>
                {initials(senderName)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#1b1c1c', flexShrink: 0 }}>
                {senderName}
              </div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {msg.snippet}
              </div>
              <div style={{ flexShrink: 0, fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)' }}>
                {format(new Date(msg.date), 'MMM d, h:mm a')}
              </div>
              <ChevronDown size={14} style={{ color: '#9c9490', flexShrink: 0 }} />
            </div>
          )
        }

        return (
          <div key={msg.id} style={{ borderTop: '1px solid #f0e8e8', padding: '16px 20px' }}>
            {/* Header row */}
            <div
              onClick={() => toggleExpand(msg.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: msg.id !== newestId ? 'pointer' : 'default' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'white' }}>
                {initials(senderName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#1b1c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {senderName}
                  {matchedClient && matchedClient.email?.toLowerCase() === senderEmail.toLowerCase() && (
                    <span style={{ fontSize: 11, backgroundColor: '#f5e8ea', color: '#640015', borderRadius: 9999, padding: '1px 7px', fontWeight: 600 }}>CRM</span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490' }}>{senderEmail}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#574141' }}>{format(new Date(msg.date), 'MMM d, yyyy')}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490' }}>{format(new Date(msg.date), 'h:mm a')}</div>
              </div>
              {msg.id !== newestId && (
                <ChevronUp size={14} style={{ color: '#9c9490', flexShrink: 0 }} />
              )}
            </div>
            {/* Body */}
            <div style={{ marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.85, color: '#4D4D4D', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {msg.body || msg.snippet}
            </div>
          </div>
        )
      })}
    </div>
  )
}
