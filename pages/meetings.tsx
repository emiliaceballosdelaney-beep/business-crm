import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StartupTabs from '../components/StartupTabs'
import { supabase, Startup, Meeting } from '../lib/supabase'

export default function Meetings() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: m }] = await Promise.all([
        supabase.from('startups').select('*').eq('status', 'active').order('created_at'),
        supabase.from('startup_meetings').select('*').order('date', { ascending: false }),
      ])
      const startupList = s ?? []
      setStartups(startupList)
      setMeetings(m ?? [])
      if (startupList.length > 0) setSelected(startupList[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selected ? meetings.filter(m => m.startup_id === selected) : meetings
  const upcoming = filtered.filter(m => new Date(m.date) >= new Date())
  const past = filtered.filter(m => new Date(m.date) < new Date())
  const startup = startups.find(s => s.id === selected)

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) return (
    <div className="layout"><Sidebar /><main className="main"><div className="loading">Loading…</div></main></div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <main className="main animate-in">
        <h1 className="page-title">Meetings</h1>
        <p className="page-subtitle">{filtered.length} meeting{filtered.length !== 1 ? 's' : ''} logged</p>

        <StartupTabs startups={startups} selected={selected} onChange={setSelected} />

        {upcoming.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Upcoming</h2>
              <span className="section-count">{upcoming.length}</span>
            </div>
            <div className="card" style={{ marginBottom: 28 }}>
              {upcoming.map((mtg) => (
                <div key={mtg.id} className="item-row">
                  <span className="item-dot item-dot-amber" />
                  <div>
                    <div className="item-title">{mtg.title}</div>
                    <div className="item-meta">{formatDate(mtg.date)}</div>
                    {mtg.attendees && mtg.attendees.length > 0 && (
                      <div className="item-meta">With: {mtg.attendees.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Past</h2>
              <span className="section-count">{past.length}</span>
            </div>
            <div className="card">
              {past.map((mtg) => (
                <div key={mtg.id} className="item-row">
                  <span className="item-dot item-dot-muted" />
                  <div>
                    <div className="item-title">{mtg.title}</div>
                    <div className="item-meta">{formatDate(mtg.date)}</div>
                    {mtg.attendees && mtg.attendees.length > 0 && (
                      <div className="item-meta">With: {mtg.attendees.join(', ')}</div>
                    )}
                    {mtg.notes && (
                      <div className="item-meta" style={{ marginTop: 4, maxWidth: 500 }}>
                        {mtg.notes.slice(0, 120)}{mtg.notes.length > 120 ? '…' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div className="empty">No meetings for {startup?.name} yet. Add one via Claude.</div>
        )}
      </main>
    </div>
  )
}
