'use client'

import { useState } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  options: string[]
  onAddNew: (v: string) => Promise<void>
  style?: React.CSSProperties
}

export default function AddableSelect({ value, onChange, options, onAddNew, style }: Props) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')

  // If stored value isn't in the list (legacy data), include it so it displays correctly
  const allOptions = value && !options.includes(value) ? [value, ...options] : options

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__add_new__') {
      setAdding(true)
    } else {
      onChange(e.target.value)
    }
  }

  const handleAdd = async () => {
    const trimmed = newVal.trim()
    if (!trimmed) return
    await onAddNew(trimmed)
    onChange(trimmed)
    setNewVal('')
    setAdding(false)
  }

  const baseStyle: React.CSSProperties = {
    fontSize: 15, fontFamily: 'var(--font-body)', color: '#1b1c1c',
    border: '1px solid #debfbf', borderRadius: 6, padding: '5px 8px',
    width: '100%', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
    ...style,
  }

  if (adding) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          autoFocus
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd()
            if (e.key === 'Escape') setAdding(false)
          }}
          placeholder="Type new option…"
          style={{ ...baseStyle, flex: 1 }}
        />
        <button
          onClick={handleAdd}
          style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
        >
          Save
        </button>
        <button
          onClick={() => { setAdding(false); setNewVal('') }}
          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #debfbf', background: 'none', color: '#574141', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <select value={value} onChange={handleChange} style={baseStyle}>
      <option value="">— None —</option>
      {allOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      <option value="__add_new__">+ Add new…</option>
    </select>
  )
}
