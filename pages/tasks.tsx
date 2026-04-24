import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StartupTabs from '../components/StartupTabs'
import { StatusBadge, PriorityDot } from '../components/Badges'
import { supabase, Startup, Task } from '../lib/supabase'

export default function Tasks() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: t }] = await Promise.all([
        supabase.from('startups').select('*').eq('status', 'active').order('created_at'),
        supabase.from('startup_tasks').select('*').order('created_at', { ascending: false }),
      ])
      const startupList = s ?? []
      setStartups(startupList)
      setTasks(t ?? [])
      if (startupList.length > 0) setSelected(startupList[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selected ? tasks.filter(t => t.startup_id === selected) : tasks
  const open = filtered.filter(t => t.status !== 'done' && t.status !== 'completed')
  const done = filtered.filter(t => t.status === 'done' || t.status === 'completed')

  const startup = startups.find(s => s.id === selected)

  if (loading) return (
    <div className="layout"><Sidebar /><main className="main"><div className="loading">Loading…</div></main></div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <main className="main animate-in">
        <h1 className="page-title">Tasks</h1>
        <p className="page-subtitle">Track what needs to get done</p>

        <StartupTabs startups={startups} selected={selected} onChange={setSelected} />

        {/* Open tasks */}
        <div className="section-header">
          <h2 className="section-title">Open</h2>
          <span className="section-count">{open.length}</span>
        </div>

        {open.length === 0 ? (
          <div className="empty" style={{ marginBottom: 32 }}>No open tasks for {startup?.name}. Add one via Claude.</div>
        ) : (
          <div className="card" style={{ marginBottom: 32 }}>
            {open.map((task) => (
              <div key={task.id} className="item-row">
                <PriorityDot priority={task.priority} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="item-title">{task.title}</span>
                    <StatusBadge status={task.status} />
                    {task.priority && (
                      <span className={`badge badge-${task.priority === 'high' ? 'green' : task.priority === 'medium' ? 'amber' : 'muted'}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <div className="item-meta" style={{ marginTop: 4 }}>{task.description}</div>
                  )}
                  {task.due_date && (
                    <div className="item-meta">
                      Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed */}
        {done.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Completed</h2>
              <span className="section-count">{done.length}</span>
            </div>
            <div className="card">
              {done.map((task) => (
                <div key={task.id} className="item-row" style={{ opacity: 0.5 }}>
                  <span className="item-dot item-dot-green" />
                  <div>
                    <div className="item-title" style={{ textDecoration: 'line-through' }}>{task.title}</div>
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
