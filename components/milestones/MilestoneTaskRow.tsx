'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Check, FolderOpen, User, ChevronDown } from 'lucide-react'
import { PRIORITY_COLORS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { logTaskActivity } from '@/lib/autoLogActivity'
import RowMenu from '@/components/shared/RowMenu'
import TaskForm from '@/components/forms/TaskForm'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import TaskExpandPanel from '@/components/tasks/TaskExpandPanel'
import type { LinkedTask } from './types'

export default function MilestoneTaskRow({ task, milestoneId, projectId }: { task: LinkedTask; milestoneId?: string; projectId?: string }) {
  const router = useRouter()
  const [toggling,   setToggling]   = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded,   setExpanded]   = useState(false)
  const completed = task.status === 'completed'

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
      milestoneId,
      projectId,
    })
    router.refresh()
  }

  const handleDelete = async () => {
    await supabase.from('tasks').delete().eq('id', task.id)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <div className={`bg-white border border-[#E8E0DC] shadow-sm ${expanded ? 'rounded-t-[10px]' : 'rounded-[10px]'} ${completed ? 'opacity-[0.85]' : ''}`}>
      <TaskForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: task.id, title: task.title, client_id: task.client_id, priority: task.priority, due_date: task.due_date, description: task.description }}
      />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={task.title}
        entityType="Task"
      />

      {/* Main row — clicking anywhere toggles expand */}
      <div
        className="p-[12px] flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div
          onClick={e => { e.stopPropagation(); handleToggle() }}
          className={`w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer transition-opacity ${toggling ? 'opacity-50' : ''} ${
            completed ? 'bg-[#640015]' : 'border-2 border-[#640015]'
          }`}
        >
          {completed && <Check size={12} className="text-[#F7F1ED]" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-label text-[13px] ${completed ? 'text-[#574141]/70 line-through' : 'text-[#4D4D4D]'}`}>
            {task.title}
          </p>
          {(task.project || task.client) && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {task.project && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F5DCE0] text-[#640015] text-[11px] font-label rounded-sm">
                  <FolderOpen size={11} />{task.project.title}
                </span>
              )}
              {task.client && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F9EDE8] text-[#8B4A4A] text-[11px] font-label rounded-sm">
                  <User size={11} />{task.client.name}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {task.due_date && !completed && (() => {
            const dueDate = new Date(task.due_date.slice(0, 10) + 'T12:00:00')
            const urgent = dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            return (
              <span className={`font-label text-[11px] ${urgent ? 'text-red-600 font-semibold' : 'text-[#8d4c44]'}`}>
                Due {format(dueDate, 'MMM d')}
              </span>
            )
          })()}
          {(() => { const p = PRIORITY_COLORS[task.priority ?? '']; return p && !completed ? (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', fontWeight: 600, backgroundColor: p.bg, color: p.text }}>
              {(task.priority ?? '').charAt(0).toUpperCase() + (task.priority ?? '').slice(1)}
            </span>
          ) : null })()}
          <div onClick={e => e.stopPropagation()}>
            <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
          </div>
          <ChevronDown
            size={15}
            className="text-[#574141]/50 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </div>

      {/* Expand panel */}
      {expanded && <TaskExpandPanel task={task} />}
    </div>
  )
}
