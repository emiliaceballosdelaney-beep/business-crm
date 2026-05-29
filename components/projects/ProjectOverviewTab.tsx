'use client'

import { Plus } from 'lucide-react'
import MilestoneTaskRow from '@/components/milestones/MilestoneTaskRow'
import type { ProjectDetailRow, ProjectLinkedTask } from './types'
import type { LinkedTask } from '@/components/milestones/types'

interface Props {
  project: ProjectDetailRow
  tasks: ProjectLinkedTask[]
  onAddTask: () => void
}

function toLinkedTask(t: ProjectLinkedTask): LinkedTask {
  return {
    id:           t.id,
    title:        t.title,
    status:       t.status,
    priority:     t.priority,
    due_date:     t.due_date,
    description:  t.description,
    created_at:   t.created_at,
    completed_at: t.completed_at,
    client_id:    t.client_id,
    client:       t.client,
    project:      null,  // suppress project pill — we're already on the project page
  }
}

export default function ProjectOverviewTab({ project, tasks, onAddTask }: Props) {
  const openTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'abandoned')
  const doneTasks = tasks.filter(t => t.status === 'completed')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 pl-3 border-l-2 border-[#640015]">
          <h2 className="font-headline text-[13px] uppercase tracking-wider font-semibold text-[#4D4D4D]">Tasks</h2>
          <span className="flex items-center justify-center w-5 h-5 bg-[#640015] text-[#F7F1ED] text-[10px] font-bold rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-body text-[#640015] border border-[#640015]/30 rounded-lg hover:bg-[#640015]/5 transition-colors"
        >
          <Plus size={11} /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="border border-dashed border-[#E8E0DC] rounded-lg p-6 text-center text-[13px] italic text-[#574141] font-body">
          No tasks linked to this project
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3 pl-3 border-l-2 border-[#640015]/40">
              <span className="font-body text-[12px] text-[#574141]/60 uppercase tracking-wider">Open · {openTasks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {openTasks.length === 0
                ? <p className="text-[13px] italic text-[#574141]/50 font-body">No open tasks</p>
                : openTasks.map(t => (
                    <MilestoneTaskRow key={t.id} task={toLinkedTask(t)} projectId={project.id} />
                  ))
              }
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 pl-3 border-l-2 border-[#574141]/30">
              <span className="font-body text-[12px] text-[#574141]/60 uppercase tracking-wider">Completed · {doneTasks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {doneTasks.length === 0
                ? <p className="text-[13px] italic text-[#574141]/50 font-body">No completed tasks</p>
                : doneTasks.map(t => (
                    <MilestoneTaskRow key={t.id} task={toLinkedTask(t)} projectId={project.id} />
                  ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
