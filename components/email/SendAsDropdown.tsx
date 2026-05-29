'use client'
import { useState, useEffect } from 'react'
import type { GmailSendAs } from '@/lib/google'

interface Props {
  value:    string
  onChange: (email: string) => void
  disabled?: boolean
}

export default function SendAsDropdown({ value, onChange, disabled }: Props) {
  const [list, setList] = useState<GmailSendAs[]>([])

  useEffect(() => {
    fetch('/api/gmail/sendas')
      .then(r => r.json())
      .then(data => {
        const items: GmailSendAs[] = data.sendAs ?? []
        setList(items)
        if (!value && items.length) {
          const def = items.find(i => i.isDefault) ?? items[0]
          onChange(def.sendAsEmail)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        border: '1px solid #debfbf', borderRadius: 8, padding: '8px 12px',
        fontFamily: 'var(--font-body)', fontSize: 14, color: '#1b1c1c',
        backgroundColor: 'white', cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none', width: '100%',
      }}
    >
      {list.map(s => (
        <option key={s.sendAsEmail} value={s.sendAsEmail}>
          {s.displayName} &lt;{s.sendAsEmail}&gt;
        </option>
      ))}
      {!list.length && value && <option value={value}>{value}</option>}
    </select>
  )
}
