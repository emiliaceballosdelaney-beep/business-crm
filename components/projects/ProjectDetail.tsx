'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FolderOpen, Calendar, ArrowLeft, CheckSquare, Target, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PROJECT_STATUS_STYLES } from '@/lib/constants'
import ProjectForm from '@/components/forms/ProjectForm'
import TaskForm from '@/components/forms/TaskForm'
import RowMenu from '@/components/shared/RowMenu'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import ProjectOverviewTab from './ProjectOverviewTab'
import ProjectActivityTab from './ProjectActivityTab'
import type { ProjectDetailRow, ProjectLinkedTask, ActivityNote } from './types'

export type { ProjectDetailRow, ProjectLinkedTask, ActivityNote }


interface Props {
  project: ProjectDetailRow
  linkedTasks: ProjectLinkedTask[]
  activityNotes: ActivityNote[]
}

export default function ProjectDetail({ project, linkedTasks, activityNotes }: Props) {
  const router = useRouter()
  const [tab,         setTab]        = useState<'overview' | 'activity'>('overview')
  const [editOpen,    setEditOpen]   = useState(false)
  const [deleteOpen,  setDeleteOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)

  const [editing,     setEditing]    = useState(false)
  const [editDesc,    setEditDesc]   = useState(project.description ?? '')
  const [editStatus,  setEditStatus] = useState(project.status)
  const [editDueDate, setEditDueDate] = useState(
    project.due_date ? new Date(project.due_date).toLocaleDateString('en-CA') : ''
  )

  const handleSaveDetails = async () => {
    await supabase.from('projects').update({
      description: editDesc || null,
      status: editStatus,
      due_date: editDueDate || null,
    }).eq('id', project.id)
    setEditing(false)
    router.refresh()
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditDesc(project.description ?? '')
    setEditStatus(project.status)
    setEditDueDate(project.due_date ? new Date(project.due_date).toLocaleDateString('en-CA') : '')
  }

  const switchTab = (t: 'overview' | 'activity') => {
    if (editing) cancelEdit()
    setTab(t)
  }

  const style       = PROJECT_STATUS_STYLES[project.status] ?? PROJECT_STATUS_STYLES.active
  const isComplete  = project.status === 'complete'
  const totalTasks  = linkedTasks.length
  const completedCount = linkedTasks.filter(t => t.status === 'completed').length
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const dateLabel = isComplete && project.due_date
    ? `Due was ${format(new Date(project.due_date), 'MMM yyyy')}`
    : project.due_date
    ? `Due: ${format(new Date(project.due_date), 'MMM yyyy')}`
    : null

  const handleDelete = async () => {
    await supabase.from('projects').delete().eq('id', project.id)
    setDeleteOpen(false)
    router.push('/projects')
  }

  const chipBase: React.CSSProperties = {
    padding: '8px 16px', backgroundColor: '#F7F1ED', border: '1px solid #E8E0DC',
    borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-body)',
    display: 'flex', alignItems: 'center', gap: 8, color: '#9c9490',
  }

  const btnStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
    border: 'none', backgroundColor: '#640015', color: 'white',
    cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ padding: '24px 40px' }}>
      <ProjectForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: project.id, title: project.title, client_id: project.client_id, description: project.description, due_date: project.due_date, status: project.status }}
      />
      <ConfirmDelete isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={project.title} entityType="Project" />
      <TaskForm isOpen={addTaskOpen} onClose={() => { setAddTaskOpen(false); router.refresh() }} prefillProjectId={project.id} prefillClientId={project.client_id ?? undefined} />

      <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9c9490', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      {/* Header block */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#640015', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FolderOpen size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: '#4D4D4D', margin: '0 0 6px 0', lineHeight: 1.2 }}>
                {project.title}
              </h1>
              <span style={{ backgroundColor: style.bg, color: style.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {style.label}
              </span>
            </div>
          </div>

          {editing ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9c9490', display: 'block', marginBottom: 4 }}>Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ fontSize: 13, fontFamily: 'var(--font-body)', padding: '7px 10px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'var(--background)', color: 'var(--foreground)', width: '100%', outline: 'none' }}>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9c9490', display: 'block', marginBottom: 4 }}>Due Date</label>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} style={{ fontSize: 13, fontFamily: 'var(--font-body)', padding: '7px 10px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'var(--background)', color: 'var(--foreground)', width: '100%', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9c9490', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} style={{ fontSize: 13, fontFamily: 'var(--font-body)', padding: '7px 10px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'var(--background)', color: 'var(--foreground)', width: '100%', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dateLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> {dateLabel}
                </div>
              )}
              {project.description && (
                <p style={{ margin: 0, fontSize: 14, color: '#574141', lineHeight: 1.6, maxWidth: 540 }}>{project.description}</p>
              )}
            </div>
          )}
        </div>

        <div style={{ paddingTop: 8, flexShrink: 0 }}>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      {/* Info chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        {project.milestoneTitle && (
          <div style={chipBase}><Target size={14} /> {project.milestoneTitle}</div>
        )}
        {project.clientName && (
          <div style={chipBase}><User size={14} /> {project.clientName}</div>
        )}
        <div style={chipBase}><CheckSquare size={14} /> {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}</div>
        {totalTasks > 0 && (
          <div style={{ ...chipBase, color: '#AB655C' }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 56, height: 4, borderRadius: 99, backgroundColor: '#E8E0DC', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progressPct}%`, backgroundColor: '#640015', borderRadius: 99 }} />
            </span>
            {progressPct}% complete
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid #debfbf', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {(['overview', 'activity'] as const).map(t => (
            <button key={t} onClick={() => switchTab(t)} style={{
              fontFamily: 'var(--font-heading)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 12px 0', marginBottom: -1,
              color: tab === t ? '#3d0009' : '#9c9490',
              borderBottom: tab === t ? '2px solid #3d0009' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 500, transition: 'color 0.15s ease',
            }}>
              {t === 'activity' ? `Activity (${activityNotes.length})` : 'Overview'}
            </button>
          ))}
        </div>
        <div style={{ paddingBottom: 12, display: 'flex', gap: 8 }}>
          {tab === 'overview' && !editing && (
            <button onClick={() => setEditing(true)} style={{ ...btnStyle, backgroundColor: 'transparent', color: '#640015', border: '1px solid #640015' }}>Edit Details</button>
          )}
          {tab === 'overview' && editing && (
            <>
              <button onClick={cancelEdit} style={{ ...btnStyle, backgroundColor: 'transparent', color: '#574141', border: '1px solid #E8E0DC' }}>Cancel</button>
              <button onClick={handleSaveDetails} style={btnStyle}>Save</button>
            </>
          )}
          {tab === 'activity' && (
            <button onClick={() => setAddNoteOpen(true)} style={btnStyle}>Log Note</button>
          )}
        </div>
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <ProjectOverviewTab
          project={project}
          tasks={linkedTasks}
          onAddTask={() => setAddTaskOpen(true)}
        />
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <ProjectActivityTab
          projectId={project.id}
          notes={activityNotes}
          addOpen={addNoteOpen}
          onAddClose={() => setAddNoteOpen(false)}
        />
      )}
    </div>
  )
}
