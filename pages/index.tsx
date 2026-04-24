import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { StageBadge } from '../components/Badges'
import { supabase, Startup, Task, Milestone } from '../lib/supabase'

export default function Overview() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: t }, { data: m }] = await Promise.all([
        supabase.from('startups').select('*').eq('status', 'active').order('created_at'),
        supabase.from('startup_tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('startup_milestones').select('*').order('target_date', { ascending: true }),
      ])
      setStartups(s ?? [])
      setTasks(t ?? [])
      setMilestones(m ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const openTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'completed')
  const upcomingMilestones = milestones.filter(m => !m.completed_at)

  const tasksByStartup = (id: string) => tasks.filter(t => t.startup_id === id && t.status !== 'done')
  const milestonesByStartup = (id: string) => milestones.filter(m => m.startup_id === id && !m.completed_at)

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="loading">Loading your startups…</div></main>
    </div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <main className="main animate-in">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Stats row */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          <div className="stat-box">
            <div className="stat-value">{startups.length}</div>
            <div className="stat-label">Active Businesses</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{openTasks.length}</div>
            <div className="stat-label">Open Tasks</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{upcomingMilestones.length}</div>
            <div className="stat-label">Upcoming Milestones</div>
          </div>
        </div>

        {/* Startup cards */}
        <div className="section-header">
          <h2 className="section-title">Your Businesses</h2>
        </div>
        <div className="grid-2" style={{ marginBottom: 36 }}>
          {startups.map((startup) => {
            const openCount = tasksByStartup(startup.id).length
            const msCount = milestonesByStartup(startup.id).length
            return (
              <div key={startup.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, lineHeight: 1.2 }}>{startup.name}</h3>
                  <StageBadge stage={startup.stage} />
                </div>
                {startup.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                    {startup.description.slice(0, 120)}{startup.description.length > 120 ? '…' : ''}
                  </p>
                )}
                {startup.website && (
                  <a href={`https://${startup.website}`} target="_blank" rel="noopener"
                     style={{ fontSize: 12, color: 'var(--green)', display: 'block', marginBottom: 12 }}>
                    ↗ {startup.website}
                  </a>
                )}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span>{openCount} open task{openCount !== 1 ? 's' : ''}</span>
                  <span>{msCount} milestone{msCount !== 1 ? 's' : ''} ahead</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Open Tasks preview */}
        {openTasks.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Open Tasks</h2>
              <span className="section-count">{openTasks.length} total</span>
            </div>
            <div className="card" style={{ marginBottom: 32 }}>
              {openTasks.slice(0, 8).map((task) => {
                const startup = startups.find(s => s.id === task.startup_id)
                return (
                  <div key={task.id} className="item-row">
                    <span className={`item-dot ${task.priority === 'high' ? 'item-dot-green' : task.priority === 'medium' ? 'item-dot-amber' : 'item-dot-muted'}`} />
                    <div>
                      <div className="item-title">{task.title}</div>
                      <div className="item-meta">
                        {startup?.name}
                        {task.due_date ? ` · Due ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                        {task.status ? ` · ${task.status.replace(/_/g, ' ')}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
              {openTasks.length > 8 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 12, textAlign: 'center' }}>
                  +{openTasks.length - 8} more · <a href="/tasks" style={{ color: 'var(--green)' }}>View all tasks →</a>
                </p>
              )}
            </div>
          </>
        )}

        {/* Upcoming milestones preview */}
        {upcomingMilestones.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Upcoming Milestones</h2>
              <span className="section-count">{upcomingMilestones.length} ahead</span>
            </div>
            <div className="card">
              {upcomingMilestones.slice(0, 5).map((ms) => {
                const startup = startups.find(s => s.id === ms.startup_id)
                return (
                  <div key={ms.id} className="item-row">
                    <span className="item-dot item-dot-amber" />
                    <div>
                      <div className="item-title">{ms.title}</div>
                      <div className="item-meta">
                        {startup?.name}
                        {ms.target_date ? ` · ${new Date(ms.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {openTasks.length === 0 && upcomingMilestones.length === 0 && (
          <div className="empty">
            No tasks or milestones yet. Add them via Claude to see them here.
          </div>
        )}
      </main>
    </div>
  )
}
