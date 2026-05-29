'use client'

import { format } from 'date-fns'

type TaskExpandData = {
  status: string
  priority?: string | null
  due_date?: string | null
  description?: string | null
  created_at?: string | null
  completed_at?: string | null
  project?: { title: string } | null
  client?: { name: string } | null
  milestone?: { title: string } | null
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pending',
  on_hold:   'On Hold',
  completed: 'Complete',
  abandoned: 'Abandoned',
}

const PRIORITY_LABEL: Record<string, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
  urgent: 'Urgent',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(87,65,65,0.6)', flexShrink: 0, minWidth: 72 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>
        {value}
      </span>
    </div>
  )
}

export default function TaskExpandPanel({ task }: { task: TaskExpandData }) {
  const isCompleted = task.status === 'completed'
  const hasContent  = task.description || task.created_at || (isCompleted && task.completed_at)
  if (!hasContent) return null

  return (
    <div style={{ backgroundColor: '#F7F1ED', borderRadius: '0 0 8px 8px', padding: '10px 12px', marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {task.description && <Row label="Notes" value={task.description} />}
      {task.created_at  && <Row label="Created" value={format(new Date(task.created_at), 'MMM d, yyyy')} />}
      {isCompleted && task.completed_at && (
        <Row label="Completed" value={format(new Date(task.completed_at), 'MMM d, yyyy')} />
      )}
    </div>
  )
}
