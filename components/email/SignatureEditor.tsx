'use client'
import { useState } from 'react'
import { Pencil } from 'lucide-react'

interface Props {
  text: string
  onSave: (text: string) => void
}

export default function SignatureEditor({ text, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)

  function handleSave() {
    onSave(draft.trim())
    setEditing(false)
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div style={{ marginTop: 8, paddingTop: 10, borderTop: '1px dashed #E8E0DC', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.7, color: '#9c9490' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>--</span>
        {!editing && (
          <button
            type="button"
            onClick={() => { setDraft(text); setEditing(true) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', padding: 0, display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontSize: 12 }}
          >
            <Pencil size={11} /> Edit signature
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#9c9490', marginBottom: 4 }}>
            One line per field. First line = your name (bold). URLs auto-link.
          </div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid #debfbf', borderRadius: 6, padding: '8px 10px', outline: 'none', resize: 'vertical', color: '#1b1c1c' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={handleSave} style={{ backgroundColor: '#640015', color: '#F7F1ED', border: 'none', borderRadius: 6, padding: '5px 14px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid #E8E0DC', borderRadius: 6, padding: '5px 14px', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer', color: '#574141' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <img src="/prosper_with_em_logo_transparent.png" alt="Prosper with Em" style={{ height: 40, width: 'auto', display: 'block', marginBottom: 4, marginTop: 4 }} />
          {lines.map((line, i) => (
            <div key={i} style={{ fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#574141' : '#9c9490' }}>
              {line}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
