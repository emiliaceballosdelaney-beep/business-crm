'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  value:    string
  onChange: (v: string) => void
}

export default function InboxSearchBar({ value, onChange }: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <Search
        size={18}
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#574141' }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search emails…"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: `1px solid ${focused ? '#AB655C' : '#debfbf'}`,
          borderRadius: 8,
          padding: '8px 36px 8px 38px',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: '#1b1c1c',
          outline: 'none',
          backgroundColor: 'white',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', display: 'flex', alignItems: 'center' }}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
