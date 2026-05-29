'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import type { ActivityNote } from './types'

const INPUT = {
  fontSize: 13, fontFamily: 'var(--font-body)',
  padding: '7px 10px', borderRadius: 6,
  border: '1px solid #E8E0DC', backgroundColor: 'var(--background)',
  color: 'var(--foreground)', width: '100%', outline: 'none',
} as const

function NoteModal({ milestoneId, onClose }: { milestoneId: string; onClose: () => void }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error: err } = await supabase.from('notes').insert({
      startup_id: PROSPER_STARTUP_ID,
      content: content.trim(),
      tags: [`milestone:${milestoneId}`],
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    onClose()
    router.refresh()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: 'var(--card)', borderRadius: 10, padding: 24, width: 480, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0, color: 'var(--foreground)' }}>Log Note</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}
          <div style={{ marginBottom: 20 }}>
            <textarea
              style={{ ...INPUT, resize: 'vertical' } as React.CSSProperties}
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's happening with this milestone?"
              disabled={loading}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !content.trim()} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: '#F7F1ED', cursor: loading || !content.trim() ? 'not-allowed' : 'pointer', opacity: loading || !content.trim() ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {loading ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface Props {
  milestoneId: string
  notes: ActivityNote[]
  addOpen: boolean
  onAddClose: () => void
}

export default function MilestoneActivityTab({ milestoneId, notes, addOpen, onAddClose }: Props) {
  return (
    <div>
      {addOpen && <NoteModal milestoneId={milestoneId} onClose={onAddClose} />}

      {notes.length === 0 ? (
        <div className="border border-dashed border-[#E8E0DC] rounded-lg p-8 text-center">
          <FileText size={24} className="text-[#574141]/30 mx-auto mb-2" />
          <p className="text-[13px] italic text-[#574141]/50 font-body">No activity yet. Use "Log Note" to track progress on this milestone.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map(note => (
            <div key={note.id} className="bg-white border border-[#E8E0DC] rounded-[10px] p-4 shadow-sm">
              <p className="font-body text-[14px] text-[#4D4D4D] leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <FileText size={11} className="text-[#574141]/40" />
                <span className="font-body text-[11px] text-[#574141]/50">
                  {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
