'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

export default function RowMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        aria-label="Options"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--muted-foreground)', padding: '2px 4px', lineHeight: 1, borderRadius: 4 }}
      >
        ⋯
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 200, backgroundColor: 'var(--card)', border: '1px solid #E8E0DC', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 110, overflow: 'hidden', marginTop: 4 }}>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
            style={{ display: 'block', width: '100%', padding: '9px 14px', background: 'none', border: 'none', borderBottom: '1px solid #F0EEEC', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--foreground)', textAlign: 'left' as const }}
          >
            Edit
          </button>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onDelete() }}
            style={{ display: 'block', width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', color: '#B91C1C', textAlign: 'left' as const }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
