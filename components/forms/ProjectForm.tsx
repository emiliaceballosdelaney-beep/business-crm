'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

interface InitialData {
  id: string
  title: string
  client_id: string | null
  description: string | null
  due_date: string | null
  status: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  prefillClientId?: string
  prefillMilestoneId?: string
  initialData?: InitialData
}

interface MilestoneOption {
  id: string
  title: string
}

interface TaskOption {
  id: string
  title: string
  project_id: string | null
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

export default function ProjectForm({ isOpen, onClose, prefillClientId, prefillMilestoneId, initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData

  // Core fields
  const [clients, setClients]     = useState<{ id: string; name: string }[]>([])
  const [title, setTitle]         = useState('')
  const [clientId, setClientId]   = useState(prefillClientId ?? '')
  const [description, setDesc]    = useState('')
  const [dueDate, setDueDate]     = useState('')
  const [status, setStatus]       = useState('active')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // Linking state
  const [linkOpen, setLinkOpen]             = useState(false)
  const [milestones, setMilestones]         = useState<MilestoneOption[]>([])
  const [availTasks, setAvailTasks]         = useState<TaskOption[]>([])
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(prefillMilestoneId ?? '')
  const [selectedTaskIds, setSelectedTaskIds]         = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return

    supabase.from('clients').select('id, name').eq('startup_id', PROSPER_STARTUP_ID).order('name')
      .then(({ data }) => setClients(data ?? []))

    // Only fetch linking options for create mode
    if (!initialData) {
      supabase
        .from('milestones')
        .select('id, title')
        .eq('startup_id', PROSPER_STARTUP_ID)
        .order('title')
        .then(({ data }) => setMilestones(data ?? []))

      supabase
        .from('tasks')
        .select('id, title, project_id')
        .eq('startup_id', PROSPER_STARTUP_ID)
        .order('title')
        .then(({ data }) => setAvailTasks(data ?? []))
    }

    if (initialData) {
      setTitle(initialData.title)
      setClientId(initialData.client_id ?? '')
      setDesc(initialData.description ?? '')
      setDueDate(initialData.due_date?.split('T')[0] ?? '')
      setStatus(initialData.status)
    } else {
      setTitle('')
      setClientId(prefillClientId ?? '')
      setDesc('')
      setDueDate('')
      setStatus('active')
    }
    setError('')
    setLinkOpen(false)
    setSelectedMilestoneId(prefillMilestoneId ?? '')
    setSelectedTaskIds([])
  }, [isOpen])

  if (!isOpen) return null

  const reset = () => {
    setTitle('')
    setClientId(prefillClientId ?? '')
    setDesc('')
    setDueDate('')
    setStatus('active')
    setError('')
    setLinkOpen(false)
    setSelectedMilestoneId(prefillMilestoneId ?? '')
    setSelectedTaskIds([])
  }
  const handleClose = () => { reset(); onClose() }

  const toggleTask = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  // Tasks that don't already belong to a different project
  const linkableTasks = availTasks.filter(t => !t.project_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      title: title.trim(),
      client_id: clientId || null,
      description: description.trim() || null,
      due_date: dueDate || null,
      status,
    }

    if (isEdit) {
      const { error: err } = await supabase.from('projects').update(payload).eq('id', initialData!.id)
      setLoading(false)
      if (err) { setError(err.message); return }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('projects')
        .insert({
          ...payload,
          startup_id: PROSPER_STARTUP_ID,
          milestone_id: selectedMilestoneId || prefillMilestoneId || null,
        })
        .select('id')
        .single()

      if (insertErr || !inserted) {
        setLoading(false)
        setError(insertErr?.message ?? 'Insert failed')
        return
      }

      const projectId = inserted.id

      // Link tasks → project
      if (selectedTaskIds.length > 0) {
        const { error: taskErr } = await supabase
          .from('tasks')
          .update({ project_id: projectId })
          .in('id', selectedTaskIds)
        if (taskErr) {
          setLoading(false)
          setError(`Project created, but task linking failed: ${taskErr.message}`)
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
            {isEdit ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>}

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Title *</label>
            <input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Q3 Financial Plan — Sarah" disabled={loading} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Client</label>
            <select style={INPUT} value={clientId} onChange={e => setClientId(e.target.value)} disabled={loading}>
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Description</label>
            <textarea style={{ ...INPUT, resize: 'vertical' } as React.CSSProperties} rows={2} value={description} onChange={e => setDesc(e.target.value)} placeholder="What is this project about?" disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={LABEL}>Due Date</label>
              <input type="date" style={INPUT} value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label style={LABEL}>Status</label>
              <select style={INPUT} value={status} onChange={e => setStatus(e.target.value)} disabled={loading}>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="complete">Complete</option>
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
                  {/* Milestone dropdown */}
                  <div>
                    <label style={LABEL}>Link to Milestone</label>
                    <select
                      style={INPUT}
                      value={selectedMilestoneId}
                      onChange={e => setSelectedMilestoneId(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">No milestone</option>
                      {milestones.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
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
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
