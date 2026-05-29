'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

interface InitialData {
  id: string
  title: string
  description: string | null
  status: string
  target_date: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  initialData?: InitialData
}

interface ProjectOption {
  id: string
  title: string
  milestone_id: string | null
}

interface TaskOption {
  id: string
  title: string
  milestone_id: string | null
}

const INPUT = {
  fontSize: 13, fontFamily: 'var(--font-body)',
  padding: '7px 10px', borderRadius: 6,
  border: '1px solid #E8E0DC', backgroundColor: 'var(--background)',
  color: 'var(--foreground)', width: '100%', outline: 'none',
} as const

const LABEL = {
  fontSize: 12, fontFamily: 'var(--font-body)',
  color: 'var(--muted-foreground)', display: 'block', marginBottom: 4,
} as const

export default function MilestoneForm({ isOpen, onClose, initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData

  // Core fields
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [targetDate, setDate]   = useState('')
  const [status, setStatus]     = useState('upcoming')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Linking state
  const [linkOpen, setLinkOpen]                   = useState(false)
  const [availProjects, setAvailProjects]         = useState<ProjectOption[]>([])
  const [availTasks, setAvailTasks]               = useState<TaskOption[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [selectedTaskIds, setSelectedTaskIds]     = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return

    // Only fetch linking options for create mode
    if (!initialData) {
      supabase
        .from('projects')
        .select('id, title, milestone_id')
        .eq('startup_id', PROSPER_STARTUP_ID)
        .order('title')
        .then(({ data }) => setAvailProjects(data ?? []))

      supabase
        .from('tasks')
        .select('id, title, milestone_id')
        .eq('startup_id', PROSPER_STARTUP_ID)
        .order('title')
        .then(({ data }) => setAvailTasks(data ?? []))
    }

    if (initialData) {
      setTitle(initialData.title)
      setDesc(initialData.description ?? '')
      setDate(initialData.target_date?.split('T')[0] ?? '')
      setStatus(initialData.status)
    } else {
      setTitle('')
      setDesc('')
      setDate('')
      setStatus('upcoming')
    }
    setError('')
    setLinkOpen(false)
    setSelectedProjectIds([])
    setSelectedTaskIds([])
  }, [isOpen])

  if (!isOpen) return null

  const reset = () => {
    setTitle('')
    setDesc('')
    setDate('')
    setStatus('upcoming')
    setError('')
    setLinkOpen(false)
    setSelectedProjectIds([])
    setSelectedTaskIds([])
  }
  const handleClose = () => { reset(); onClose() }

  const toggleProject = (id: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleTask = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  // Only show projects/tasks not already linked to a different milestone
  const linkableProjects = availProjects.filter(p => !p.milestone_id)
  const linkableTasks    = availTasks.filter(t => !t.milestone_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      target_date: targetDate || null,
      status,
    }

    if (isEdit) {
      const { error: err } = await supabase.from('milestones').update(payload).eq('id', initialData!.id)
      setLoading(false)
      if (err) { setError(err.message); return }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('milestones')
        .insert({ ...payload, startup_id: PROSPER_STARTUP_ID })
        .select('id')
        .single()

      if (insertErr || !inserted) {
        setLoading(false)
        setError(insertErr?.message ?? 'Insert failed')
        return
      }

      const milestoneId = inserted.id

      // Link projects → milestone
      if (selectedProjectIds.length > 0) {
        const { error: projErr } = await supabase
          .from('projects')
          .update({ milestone_id: milestoneId })
          .in('id', selectedProjectIds)
        if (projErr) {
          setLoading(false)
          setError(`Milestone created, but project linking failed: ${projErr.message}`)
          return
        }
      }

      // Link tasks → milestone
      if (selectedTaskIds.length > 0) {
        const { error: taskErr } = await supabase
          .from('tasks')
          .update({ milestone_id: milestoneId })
          .in('id', selectedTaskIds)
        if (taskErr) {
          setLoading(false)
          setError(`Milestone created, but task linking failed: ${taskErr.message}`)
          return
        }
      }

      setLoading(false)
    }

    reset()
    onClose()
    router.refresh()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={handleClose}
    >
      <div
        style={{ backgroundColor: 'var(--card)', borderRadius: 10, padding: 24, width: 440, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0, color: 'var(--foreground)' }}>
            {isEdit ? 'Edit Milestone' : 'Add Milestone'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Title *</label>
            <input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. First paying client" disabled={loading} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Description</label>
            <textarea style={{ ...INPUT, resize: 'vertical' } as React.CSSProperties} rows={2} value={description} onChange={e => setDesc(e.target.value)} placeholder="What does reaching this milestone mean?" disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={LABEL}>Target Date</label>
              <input type="date" style={INPUT} value={targetDate} onChange={e => setDate(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label style={LABEL}>Status</label>
              <select style={INPUT} value={status} onChange={e => setStatus(e.target.value)} disabled={loading}>
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="achieved">Achieved</option>
              </select>
            </div>
          </div>

          {/* Link associations — create mode only */}
          {!isEdit && (
            <div style={{ marginBottom: 20, border: '1px solid #E8E0DC', borderRadius: 6, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setLinkOpen(prev => !prev)}
                disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F7F1ED', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: '#574141' }}
              >
                <span>Link associations</span>
                <span style={{ fontSize: 16, lineHeight: 1, color: '#640015' }}>{linkOpen ? '−' : '+'}</span>
              </button>

              {linkOpen && (
                <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Project multi-select checklist */}
                  <div>
                    <label style={LABEL}>
                      Link Projects
                      {linkableProjects.length === 0 && <span style={{ color: '#AB655C', marginLeft: 6 }}>(no unlinked projects)</span>}
                    </label>
                    {linkableProjects.length > 0 && (
                      <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #E8E0DC', borderRadius: 6, padding: '4px 0' }}>
                        {linkableProjects.map(p => (
                          <label
                            key={p.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--foreground)' }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedProjectIds.includes(p.id)}
                              onChange={() => toggleProject(p.id)}
                              disabled={loading}
                              style={{ accentColor: '#640015', flexShrink: 0 }}
                            />
                            {p.title}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Task multi-select checklist */}
                  <div>
                    <label style={LABEL}>
                      Link Tasks
                      {linkableTasks.length === 0 && <span style={{ color: '#AB655C', marginLeft: 6 }}>(no unlinked tasks)</span>}
                    </label>
                    {linkableTasks.length > 0 && (
                      <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #E8E0DC', borderRadius: 6, padding: '4px 0' }}>
                        {linkableTasks.map(t => (
                          <label
                            key={t.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--foreground)' }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.includes(t.id)}
                              onChange={() => toggleTask(t.id)}
                              disabled={loading}
                              style={{ accentColor: '#640015', flexShrink: 0 }}
                            />
                            {t.title}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: '#F7F1ED', cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading || !title.trim() ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
