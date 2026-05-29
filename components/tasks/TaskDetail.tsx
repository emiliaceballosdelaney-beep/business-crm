'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckSquare, ArrowLeft, Check, FolderOpen, Target, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { TASK_STATUS_STYLES, PRIORITY_COLORS } from '@/lib/constants'
import TaskForm from '@/components/forms/TaskForm'
import RowMenu from '@/components/shared/RowMenu'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import TaskOverviewTab from './TaskOverviewTab'
import TaskActivityTab from './TaskActivityTab'
import type { TaskDetailRow, ActivityNote } from './types'

export type { TaskDetailRow, ActivityNote }

const PRIORITY_LABELS: Record<string, string> = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' }

interface Props {
  task: TaskDetailRow
  activityNotes: ActivityNote[]
}

export default function TaskDetail({ task, activityNotes }: Props) {
  const router  = useRouter()
  const [tab,        setTab]        = useState<'overview' | 'activity'>('overview')
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [toggling,   setToggling]   = useState(false)

  const completed   = task.status === 'completed'
  const statusStyle   = TASK_STATUS_STYLES[task.status]   ?? TASK_STATUS_STYLES.pending
  const priorityStyle = task.priority ? (PRIORITY_COLORS[task.priority] ?? null) : null
  const priorityLabel = task.priority ? (PRIORITY_LABELS[task.priority] ?? task.priority) : null

  const handleToggle = async () => {
    if (toggling) return
    setToggling(true)
    await supabase.from('tasks').update({ status: completed ? 'pending' : 'completed' }).eq('id', task.id)
    setToggling(false)
    router.refresh()
  }

  const handleDelete = async () => {
    await supabase.from('tasks').delete().eq('id', task.id)
    setDeleteOpen(false)
    router.push('/tasks')
  }

  const btnStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
    border: 'none', backgroundColor: '#640015', color: 'white',
    cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', whiteSpace: 'nowrap',
  }

  const chipBase: React.CSSProperties = {
    padding: '8px 16px', backgroundColor: '#F7F1ED', border: '1px solid #E8E0DC',
    borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-body)',
    display: 'flex', alignItems: 'center', gap: 8, color: '#9c9490',
  }

  return (
    <div style={{ padding: '24px 40px' }}>
      <TaskForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: task.id, title: task.title, client_id: task.client_id, priority: task.priority, due_date: task.due_date, description: task.description }}
      />
      <ConfirmDelete isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={task.title} entityType="Task" />

      <Link href="/tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9c9490', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to Tasks
      </Link>

      {/* Header block */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#640015', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckSquare size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: '#4D4D4D', margin: '0 0 6px 0', lineHeight: 1.2 }}>
                {task.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                  {statusStyle.label}
                </span>
                {priorityStyle && (
                  <span style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                    {priorityLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: checkbox + row menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, flexShrink: 0 }}>
          <div
            onClick={handleToggle}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
            style={{
              width: 24, height: 24, borderRadius: 4, cursor: toggling ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: toggling ? 0.5 : 1, transition: 'opacity 0.15s',
              backgroundColor: completed ? '#640015' : 'transparent',
              border: completed ? 'none' : '2px solid #640015',
            }}
          >
            {completed && <Check size={14} color="white" />}
          </div>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      {/* Info chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        {task.projectTitle && (
          <div style={chipBase}><FolderOpen size={14} /> {task.projectTitle}</div>
        )}
        {task.milestoneTitle && (
          <div style={chipBase}><Target size={14} /> {task.milestoneTitle}</div>
        )}
        {task.clientName && (
          <div style={chipBase}><User size={14} /> {task.clientName}</div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid #debfbf', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {(['overview', 'activity'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
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
        <div style={{ paddingBottom: 12 }}>
          {tab === 'activity' && (
            <button onClick={() => setAddNoteOpen(true)} style={btnStyle}>Log Note</button>
          )}
        </div>
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <TaskOverviewTab task={task} />
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <TaskActivityTab
          taskId={task.id}
          notes={activityNotes}
          addOpen={addNoteOpen}
          onAddClose={() => setAddNoteOpen(false)}
        />
      )}
    </div>
  )
}
