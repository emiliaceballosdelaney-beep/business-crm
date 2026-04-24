import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StartupTabs from '../components/StartupTabs'
import { supabase, Startup, Milestone } from '../lib/supabase'

export default function Milestones() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: m }] = await Promise.all([
        supabase.from('startups').select('*').eq('status', 'active').order('created_at'),
        supabase.from('startup_milestones').select('*').order('target_date', { ascending: true }),
      ])
      const startupList = s ?? []
      setStartups(startupList)
      setMilestones(m ?? [])
      if (startupList.length > 0) setSelected(startupList[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selected ? milestones.filter(m => m.startup_id === selected) : milestones
  const upcoming = filtered.filter(m => !m.completed_at)
  const completed = filtered.filter(m => !!m.completed_at)
  const startup = startups.find(s => s.id === selected)

  function formatDate(date: string | null) {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  function daysUntil(date: string | null) {
    if (!date) return null
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return `${Math.abs(diff)}d overdue`
    if (diff === 0) return 'today'
    return `${diff}d away`
  }

  if (loading) return (
    <div className="layout"><Sidebar /><main className="main"><div className="loading">Loading…</div></main></div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <main className="main animate-in">
        <h1 className="page-title">Milestones</h1>
        <p className="page-subtitle">Key goals and checkpoints</p>

        <StartupTabs startups={startups} selected={selected} onChange={setSelected} />

        <div className="section-header">
          <h2 className="section-title">Upcoming</h2>
          <span className="section-count">{upcoming.length}</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty" style={{ marginBottom: 32 }}>
            No upcoming milestones for {startup?.name}. Add one via Claude.
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 32 }}>
            {upcoming.map((ms) => {
              const until = daysUntil(ms.target_date)
              const isOverdue = until?.includes('overdue')
              return (
                <div key={ms.id} className="item-row">
                  <span className={`item-dot ${isOverdue ? 'item-dot-green' : 'item-dot-amber'}`}
                    style={{ background: isOverdue ? 'var(--rose)' : undefined }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                      <span className="item-title">{ms.title}</span>
                      {until && (
                        <span style={{ fontSize: 12, color: isOverdue ? 'var(--rose)' : 'var(--text-muted)', flexShrink: 0 }}>
                          {until}
                        </span>
                      )}
                    </div>
                    {ms.description && <div className="item-meta" style={{ marginTop: 4 }}>{ms.description}</div>}
                    {ms.target_date && <div className="item-meta">Target: {formatDate(ms.target_date)}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {completed.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Completed</h2>
              <span className="section-count">{completed.length}</span>
            </div>
            <div className="card">
              {completed.map((ms) => (
                <div key={ms.id} className="item-row" style={{ opacity: 0.5 }}>
                  <span className="item-dot item-dot-green" />
                  <div>
                    <div className="item-title" style={{ textDecoration: 'line-through' }}>{ms.title}</div>
                    {ms.completed_at && <div className="item-meta">Completed {formatDate(ms.completed_at)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
