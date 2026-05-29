'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import type { TaskRow } from '@/components/home/types'
import { PRIORITY_COLORS } from '@/lib/constants'
import TaskForm from '@/components/forms/TaskForm'
import { supabase } from '@/lib/supabase'

function AssocPills({ task }: { task: TaskRow }) {
  const pills = []
  if (task.project) pills.push(
    <span key="project" style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, backgroundColor: '#efeded', border: '1px solid rgba(222,191,191,0.5)', fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#574141' }}>
      {task.project.title}
    </span>
  )
  if (task.client) pills.push(
    <span key="client" style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, backgroundColor: 'rgba(255,179,180,0.2)', border: '1px solid rgba(255,179,180,0.5)', fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#8d4c44' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8d4c44', marginRight: 6, flexShrink: 0, display: 'inline-block' }} />
      {task.client.name}
    </span>
  )
  if (task.milestone) pills.push(
    <span key="milestone" style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, backgroundColor: '#efeded', border: '1px solid rgba(222,191,191,0.5)', fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#574141' }}>
      {task.milestone.title}
    </span>
  )
  if (pills.length === 0) return null
  return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{pills}</div>
}

function HomeTaskRow({ task, isLast, onToggle }: { task: TaskRow; isLast: boolean; onToggle: (id: string, completed: boolean) => void }) {
  const router = useRouter()
  const isCompleted = task.status === 'completed'

  return (
    <div
      role="button"
      onClick={() => router.push(`/tasks/${task.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: 16,
        borderBottom: isLast ? 'none' : '1px solid #D9CDC5',
        cursor: 'pointer',
      }}
    >
      {/* Checkbox */}
      <div
        style={{ flexShrink: 0, cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); onToggle(task.id, !isCompleted) }}
      >
        <div style={{ width: 20, height: 20, borderRadius: 3, border: isCompleted ? 'none' : '2px solid #8a7171', backgroundColor: isCompleted ? '#640015' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCompleted && <span style={{ color: 'white', fontSize: 11, lineHeight: 1 }}>✓</span>}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#1b1c1c', margin: 0, textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.5 : 1 }}>
          {task.title}
        </p>
        <AssocPills task={task} />
      </div>

      {/* Right cluster */}
      {!isCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {task.due_date && (() => {
            // Append T00:00:00 so the date string is parsed as local midnight, not UTC midnight
            const dueDate = new Date(task.due_date.slice(0, 10) + 'T00:00:00')
            const urgent = dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            return (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: urgent ? 600 : 400, color: urgent ? '#dc2626' : '#AB655C' }}>
                Due {format(dueDate, 'MMM d')}
              </span>
            )
          })()}
          {task.priority && (() => {
            const p = PRIORITY_COLORS[task.priority]
            return p ? (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', fontWeight: 600, backgroundColor: p.bg, color: p.text }}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            ) : null
          })()}
        </div>
      )}

      {/* Arrow indicator */}
      <span style={{ fontSize: 14, color: '#AB655C', opacity: 0.6, flexShrink: 0 }}>→</span>
    </div>
  )
}

export default function HomeTasksSection({ tasks }: { tasks: TaskRow[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(tasks.map(t => [t.id, t.status]))
  )

  async function handleToggle(id: string, markCompleted: boolean) {
    const newStatus = markCompleted ? 'completed' : 'open'
    setStatuses(prev => ({ ...prev, [id]: newStatus }))
    await supabase.from('tasks').update({
      status: newStatus,
      completed_at: markCompleted ? new Date().toISOString() : null,
    }).eq('id', id)
    router.refresh()
  }

  const tasksWithStatus = tasks.map(t => ({ ...t, status: statuses[t.id] ?? t.status }))
  const open = tasksWithStatus.filter(t => t.status !== 'completed')
  const done = tasksWithStatus.filter(t => t.status === 'completed')
  const ordered = [...open, ...done]

  return (
    <div>
      <TaskForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      {/* Section heading */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, paddingLeft: 12, borderLeft: '2px solid #3d0009' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, color: '#1b1c1c', margin: 0 }}>
            Tasks Due Today
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            style={{ backgroundColor: '#640015', color: 'white', fontSize: 12, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Tasks container */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.3)', border: '1px solid rgba(226,232,240,0.5)', borderRadius: 12, padding: 16, overflow: 'hidden' }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 13, fontStyle: 'italic', color: '#574141', fontFamily: 'var(--font-body)', padding: '20px 0' }}>
            No tasks due today
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ordered.map((task, idx) => (
              <HomeTaskRow key={task.id} task={task} isLast={idx === ordered.length - 1} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
