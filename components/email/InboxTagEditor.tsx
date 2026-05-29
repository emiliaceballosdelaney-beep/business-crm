'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const PRESETS = ['Needs Reply', 'Follow Up', 'Client', 'Billing', 'Urgent', 'FYI']
const STORAGE_KEY = 'crmCustomTags'

interface Props {
  labels:   string[]
  onChange: (labels: string[]) => void
  saving?:  boolean
}

export default function InboxTagEditor({ labels, onChange, saving }: Props) {
  const [input, setInput]         = useState('')
  const [focused, setFocused]     = useState(false)
  const [customTags, setCustomTags] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCustomTags(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const allOptions = [...PRESETS, ...customTags.filter(t => !PRESETS.includes(t))]
  const suggestions = allOptions.filter(
    p => !labels.includes(p) && p.toLowerCase().includes(input.toLowerCase()),
  )
  const trimmed = input.trim()
  const showAddNew = !!trimmed && !labels.includes(trimmed) && !allOptions.some(o => o.toLowerCase() === trimmed.toLowerCase())

  function addTag(tag: string) {
    const t = tag.trim()
    if (!t || labels.includes(t)) { setInput(''); return }
    // persist custom tags to localStorage
    if (!PRESETS.includes(t) && !customTags.includes(t)) {
      const updated = [...customTags, t]
      setCustomTags(updated)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
    }
    onChange([...labels, t])
    setInput('')
  }

  function removeTag(tag: string) { onChange(labels.filter(l => l !== tag)) }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input) }
    if (e.key === 'Backspace' && !input && labels.length) removeTag(labels[labels.length - 1])
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490', fontWeight: 500, flexShrink: 0 }}>Tags:</span>
      {labels.map(l => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, backgroundColor: '#f5e8ea', color: '#640015', borderRadius: 9999, padding: '2px 8px 2px 10px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
          {l}
          <button onClick={() => removeTag(l)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#AB655C', display: 'flex', alignItems: 'center' }}>
            <X size={10} />
          </button>
        </span>
      ))}
      <div style={{ position: 'relative' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={labels.length ? '+ tag' : '+ Add tag'}
          style={{ border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 12, color: '#574141', backgroundColor: 'transparent', width: input ? `${Math.max(input.length + 3, 6)}ch` : 72, minWidth: 60, cursor: 'pointer' }}
        />
        {focused && (suggestions.length > 0 || showAddNew) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '4px 0', minWidth: 160, marginTop: 4 }}>
            {suggestions.map(s => (
              <button key={s} onMouseDown={() => addTag(s)}
                style={{ width: '100%', textAlign: 'left', padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: '#4D4D4D' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdf6f6')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >{s}</button>
            ))}
            {showAddNew && (
              <>
                {suggestions.length > 0 && <div style={{ height: 1, backgroundColor: '#f0e8e8', margin: '4px 0' }} />}
                <button onMouseDown={() => addTag(trimmed)}
                  style={{ width: '100%', textAlign: 'left', padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: '#640015', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdf6f6')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >+ Add &quot;{trimmed}&quot;</button>
              </>
            )}
          </div>
        )}
      </div>
      {saving && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#9c9490' }}>Saving…</span>}
    </div>
  )
}
