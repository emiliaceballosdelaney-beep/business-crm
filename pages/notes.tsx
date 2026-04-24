import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StartupTabs from '../components/StartupTabs'
import { supabase, Startup, Note } from '../lib/supabase'

export default function Notes() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: n }] = await Promise.all([
        supabase.from('startups').select('*').eq('status', 'active').order('created_at'),
        supabase.from('startup_notes').select('*').order('created_at', { ascending: false }),
      ])
      const startupList = s ?? []
      setStartups(startupList)
      setNotes(n ?? [])
      if (startupList.length > 0) setSelected(startupList[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selected ? notes.filter(n => n.startup_id === selected) : notes
  const startup = startups.find(s => s.id === selected)

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return (
    <div className="layout"><Sidebar /><main className="main"><div className="loading">Loading…</div></main></div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <main className="main animate-in">
        <h1 className="page-title">Notes</h1>
        <p className="page-subtitle">{filtered.length} note{filtered.length !== 1 ? 's' : ''}</p>

        <StartupTabs startups={startups} selected={selected} onChange={setSelected} />

        {filtered.length === 0 ? (
          <div className="empty">No notes for {startup?.name} yet. Add one via Claude.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((note) => (
              <div key={note.id} className="card">
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </p>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(note.created_at)}</span>
                  {note.tags && note.tags.map((tag) => (
                    <span key={tag} className="badge badge-muted">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
