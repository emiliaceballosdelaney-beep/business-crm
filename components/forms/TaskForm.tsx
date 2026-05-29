'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { logTaskActivity } from '@/lib/autoLogActivity'

interface InitialData {
  id: string
  title: string
  client_id: string | null
  priority: string
  due_date: string | null
  description: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  prefillClientId?: string
  prefillMilestoneId?: string
  prefillProjectId?: string
  initialData?: InitialData
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

export default function TaskForm({ isOpen, onClose, prefillClientId, prefillMilestoneId, prefillProjectId, initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData
  const [clients,    setClients]    = useState<{ id: string; name: string }[]>([])
  const [projects,   setProjects]   = useState<{ id: string; title: string }[]>([])
  const [milestones, setMilestones] = useState<{ id: string; title: string }[]>([])
  const [title,       setTitle]       = useState('')
  const [clientId,    setClientId]    = useState(prefillClientId ?? '')
  const [projectId,   setProjectId]   = useState(prefillProjectId ?? '')
  const [milestoneId, setMilestoneId] = useState(prefillMilestoneId ?? '')
  const [priority,    setPriority]    = useState('medium')
  const [dueDate,     setDueDate]     = useState('')
  const [notes,       setNotes]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (!isOpen) return
    supabase.from('clients').select('id, name').eq('startup_id', PROSPER_STARTUP_ID).order('name')
      .then(({ data }) => setClients(data ?? []))
    supabase.from('projects').select('id, title').eq('startup_id', PROSPER_STARTUP_ID).order('title')
      .then(({ data }) => setProjects(data ?? []))
    supabase.from('milestones').select('id, title').eq('startup_id', PROSPER_STARTUP_ID).order('title')
      .then(({ data }) => setMilestones(data ?? []))
    if (initialData) {
      setTitle(initialData.title)
      setClientId(initialData.client_id ?? '')
      setPriority(initialData.priority)
      setDueDate(initialData.due_date?.split('T')[0] ?? '')
      setNotes(initialData.description ?? '')
    } else {
      setTitle(''); setClientId(prefillClientId ?? ''); setPriority('medium'); setDueDate(''); setNotes('')
      setProjectId(prefillProjectId ?? ''); setMilestoneId(prefillMilestoneId ?? '')
    }
    setError('')
  }, [isOpen])

  if (!isOpen) return null

  const reset = () => {
    setTitle(''); setClientId(prefillClientId ?? ''); setPriority('medium'); setDueDate(''); setNotes('')
    setProjectId(prefillProjectId ?? ''); setMilestoneId(prefillMilestoneId ?? ''); setError('')
  }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const trimmedTitle = title.trim()
    const payload = {
      title: trimmedTitle,
      client_id: clientId || null,
      priority,
      due_date: dueDate || null,
      description: notes.trim() || null,
    }
    if (isEdit) {
      const { error: err } = await supabase.from('tasks').update(payload).eq('id', initialData!.id)
      setLoading(false)
      if (err) { setError(err.message); return }
    } else {
      const { data: inserted, error: err } = await supabase
        .from('tasks')
        .insert({ ...payload, startup_id: PROSPER_STARTUP_ID, status: 'pending', milestone_id: milestoneId || null, project_id: projectId || null })
        .select('id')
        .single()
      setLoading(false)
      if (err) { setError(err.message); return }
      if (inserted) {
        logTaskActivity({
          taskId: inserted.id,
          taskTitle: trimmedTitle,
          content: 'Task created',
          startupId: PROSPER_STARTUP_ID,
          milestoneId: milestoneId || null,
          projectId: projectId || null,
        })
      }
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
        style={{ backgroundColor: 'var(--card)', borderRadius: 10, padding: 24, width: 440, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0, color: 'var(--foreground)' }}>
            {isEdit ? 'Edit Task' : 'Add Task'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Title *</label>
            <input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required placeholder="What needs to be done?" disabled={loading} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Client</label>
            <select style={INPUT} value={clientId} onChange={e => setClientId(e.target.value)} disabled={loading}>
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {!isEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={LABEL}>Project</label>
                <select style={INPUT} value={projectId} onChange={e => setProjectId(e.target.value)} disabled={loading}>
                  <option value="">No project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL}>Milestone</label>
                <select style={INPUT} value={milestoneId} onChange={e => setMilestoneId(e.target.value)} disabled={loading}>
                  <option value="">No milestone</option>
                  {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Priority</label>
              <select style={INPUT} value={priority} onChange={e => setPriority(e.target.value)} disabled={loading}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={LABEL}>Due Date</label>
              <input type="date" style={INPUT} value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Notes</label>
            <textarea style={{ ...INPUT, resize: 'vertical' } as React.CSSProperties} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional details…" disabled={loading} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: '#F7F1ED', cursor: loading || !title.trim() ? 'not-allowed' : 'pointer', opacity: loading || !title.trim() ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
