import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StartupTabs from '../components/StartupTabs'
import { StatusBadge } from '../components/Badges'
import { supabase, Startup, Client } from '../lib/supabase'

export default function Clients() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from('startups').select('*').eq('status', 'active').order('created_at'),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
      ])
      const startupList = s ?? []
      setStartups(startupList)
      setClients(c ?? [])
      if (startupList.length > 0) setSelected(startupList[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selected ? clients.filter(c => c.startup_id === selected) : clients
  const active = filtered.filter(c => c.status === 'active')
  const other = filtered.filter(c => c.status !== 'active')
  const startup = startups.find(s => s.id === selected)

  if (loading) return (
    <div className="layout"><Sidebar /><main className="main"><div className="loading">Loading…</div></main></div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <main className="main animate-in">
        <h1 className="page-title">Clients</h1>
        <p className="page-subtitle">{filtered.length} client{filtered.length !== 1 ? 's' : ''} tracked</p>

        <StartupTabs startups={startups} selected={selected} onChange={setSelected} />

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div className="stat-box">
            <div className="stat-value">{filtered.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{active.length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{other.length}</div>
            <div className="stat-label">Other</div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">No clients for {startup?.name} yet. Add one via Claude.</div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <div className="section-header">
                  <h2 className="section-title">Active</h2>
                </div>
                <div className="card" style={{ marginBottom: 24 }}>
                  {active.map((client) => (
                    <div key={client.id} className="item-row">
                      <span className="item-dot item-dot-green" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                          <span className="item-title">{client.name}</span>
                          {client.status && <StatusBadge status={client.status} />}
                        </div>
                        {client.email && <div className="item-meta">{client.email}</div>}
                        {client.notes && <div className="item-meta" style={{ marginTop: 4 }}>{client.notes.slice(0, 100)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {other.length > 0 && (
              <>
                <div className="section-header">
                  <h2 className="section-title">Other</h2>
                </div>
                <div className="card">
                  {other.map((client) => (
                    <div key={client.id} className="item-row" style={{ opacity: 0.6 }}>
                      <span className="item-dot item-dot-muted" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="item-title">{client.name}</span>
                          {client.status && <StatusBadge status={client.status} />}
                        </div>
                        {client.email && <div className="item-meta">{client.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
