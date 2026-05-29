'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ChevronDown, FolderOpen, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { logTaskActivity } from '@/lib/autoLogActivity'
import type { TaskDetailRow } from './types'
import TaskForm from '@/components/forms/TaskForm'
import RowMenu from '@/components/shared/RowMenu'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import TaskExpandPanel from '@/components/tasks/TaskExpandPanel'

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high:   { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low:    { bg: '#F0EEEC', text: '#6B6360' },
}

export default function TasksTab({ tasks, clientId }: { tasks: TaskDetailRow[]; clientId: string }) {
  const [showForm, setShowForm] = useState(false)
  const open = tasks.filter(t => t.status !== 'completed' && t.status !== 'abandoned')
  const done = tasks.filter(t => t.status === 'completed')

  return (
    <div>
      <TaskForm isOpen={showForm} onClose={() => setShowForm(false)} prefillClientId={clientId} />

      {tasks.length === 0 ? (
        <div style={{ border: '2px dashed rgba(222,191,191,0.5)', borderRadius: 8, padding: '40px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontStyle: 'italic', color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0 }}>No tasks yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {open.length > 0 && (
            <section>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 10px 0' }}>
                Open · {open.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {open.map(t => <TaskRow key={t.id} task={t} clientId={clientId} />)}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 10px 0' }}>
                Completed · {done.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {done.map(t => <TaskRow key={t.id} task={t} completed clientId={clientId} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, completed = false, clientId }: { task: TaskDetailRow; completed?: boolean; clientId: string }) {
  const router = useRouter()
  const [toggling,   setToggling]   = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded,   setExpanded]   = useState(false)

  const priorityStyle = task.priority ? PRIORITY_COLORS[task.priority] : null
  const assocIcon = task.project ? <FolderOpen size={11} /> : task.milestone ? <Target size={11} /> : null
  const assocTitle = task.project ? task.project.title : task.milestone ? task.milestone.title : null

  const handleToggle = async () => {
    if (toggling) return
    setToggling(true)
    const newStatus = completed ? 'pending' : 'completed'
    await supabase.from('tasks').update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }).eq('id', task.id)
    setToggling(false)
    logTaskActivity({
      taskId: task.id,
      taskTitle: task.title,
      content: newStatus === 'completed' ? 'Marked complete' : 'Reopened',
      startupId: PROSPER_STARTUP_ID,
    })
    router.refresh()
  }

  const handleDelete = async () => {
    await supabase.from('tasks').delete().eq('id', task.id)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: expanded ? '10px 10px 0 0' : 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', opacity: completed ? 0.65 : 1 }}>
      <TaskForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        prefillClientId={clientId}
        initialData={{ id: task.id, title: task.title, client_id: clientId, priority: task.priority, due_date: task.due_date, description: task.description }}
      />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={task.title}
        entityType="Task"
      />

      {/* Main row */}
      <div
        style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Checkbox */}
        <div
          onClick={e => { e.stopPropagation(); handleToggle() }}
          style={{ width: 20, height: 20, borderRadius: 4, border: completed ? 'none' : '2px solid #640015', backgroundColor: completed ? '#640015' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: toggling ? 'wait' : 'pointer', opacity: toggling ? 0.5 : 1 }}
        >
          {completed && <span style={{ color: 'white', fontSize: 12, lineHeight: 1 }}>✓</span>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: '#1b1c1c', margin: '0 0 4px 0', fontWeight: 500, textDecoration: completed ? 'line-through' : 'none' }}>
            {task.title}
          </p>
          {assocTitle && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-body)', backgroundColor: task.project ? '#F5E8EA' : '#F0EEEC', color: task.project ? '#640015' : '#6B6360', border: `1px solid ${task.project ? 'rgba(201,160,168,0.5)' : 'rgba(212,207,204,0.5)'}` }}>
              {assocIcon}{assocTitle}
            </span>
          )}
        </div>

        {/* Right cluster — due left, priority right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {task.due_date && !completed && (() => {
            const dueDate = new Date(task.due_date.slice(0, 10) + 'T00:00:00')
            const urgent = dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            return (
              <span style={{ fontSize: 11, color: urgent ? '#dc2626' : '#AB655C', fontWeight: urgent ? 600 : 400, fontFamily: 'var(--font-body)' }}>
                Due {format(dueDate, 'MMM d')}
              </span>
            )
          })()}
          {priorityStyle && task.priority && !completed && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', fontWeight: 600, backgroundColor: priorityStyle.bg, color: priorityStyle.text }}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
        </div>

        <div onClick={e => e.stopPropagation()}>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>

        <ChevronDown
          size={15}
          style={{ flexShrink: 0, color: 'rgba(87,65,65,0.5)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        />
      </div>

      {/* Expand panel */}
      {expanded && <TaskExpandPanel task={task} />}
    </div>
  )
}
