'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  selected: string[]
  allOptions: string[]
  onAdd: (t: string) => void
  onRemove: (t: string) => void
  onAddNew: (t: string) => Promise<void>
}

export default function ToolsCombobox({ selected, allOptions, onAdd, onRemove, onAddNew }: Props) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = allOptions.filter(
    t => t.toLowerCase().includes(search.toLowerCase()) && !selected.includes(t)
  )
  const exactMatch = allOptions.some(t => t.toLowerCase() === search.trim().toLowerCase())
  const canAddNew = search.trim().length > 0 && !exactMatch

  const handleSelect = (t: string) => {
    onAdd(t)
    setSearch('')
    setOpen(false)
  }

  const handleAddNew = async () => {
    const trimmed = search.trim()
    if (!trimmed) return
    await onAddNew(trimmed)
    onAdd(trimmed)
    setSearch('')
    setOpen(false)
  }

  const inputStyle: React.CSSProperties = {
    fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D',
    border: '1px solid #debfbf', borderRadius: 6, padding: '4px 8px',
    width: '100%', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
  }

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {selected.map(t => (
            <span key={t} style={{ backgroundColor: '#F7F1ED', border: '1px solid rgba(171,101,92,0.4)', fontSize: 11, padding: '4px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', color: '#4D4D4D', display: 'flex', alignItems: 'center', gap: 4 }}>
              {t}
              <button onClick={() => onRemove(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', fontSize: 12, padding: 0, lineHeight: 1, marginLeft: 2 }}>×</button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} style={{ position: 'relative' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' && canAddNew) handleAddNew() }}
          placeholder="Search or add a tool…"
          style={inputStyle}
        />
        {open && (filtered.length > 0 || canAddNew) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #debfbf', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 200, overflowY: 'auto', marginTop: 2 }}>
            {filtered.map(t => (
              <button
                key={t}
                onMouseDown={e => { e.preventDefault(); handleSelect(t) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', color: '#1b1c1c' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7F1ED')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {t}
              </button>
            ))}
            {canAddNew && (
              <button
                onMouseDown={e => { e.preventDefault(); handleAddNew() }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', color: '#640015', fontWeight: 600, borderTop: filtered.length > 0 ? '1px solid #F7F1ED' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7F1ED')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                + Add &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
