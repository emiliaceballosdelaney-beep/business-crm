'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Target, User, Calendar, FolderOpen, AlertCircle } from 'lucide-react'
import type { TaskDetailRow } from './types'
import { TASK_STATUS_STYLES, PRIORITY_COLORS } from '@/lib/constants'

const PRIORITY_LABELS: Record<string, string> = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' }

interface Props {
  task: TaskDetailRow
}

export default function TaskOverviewTab({ task }: Props) {
  const statusStyle   = TASK_STATUS_STYLES[task.status]   ?? TASK_STATUS_STYLES.pending
  const priorityStyle = task.priority ? (PRIORITY_COLORS[task.priority] ?? null) : null
  const priorityLabel = task.priority ? (PRIORITY_LABELS[task.priority] ?? task.priority) : null

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 pl-3 border-l-2 border-[#640015]">
          <h2 className="font-headline text-[13px] uppercase tracking-wider font-semibold text-[#4D4D4D]">Details</h2>
        </div>
        <div className="bg-white border border-[#E8E0DC] rounded-[10px] p-5 shadow-sm flex flex-col gap-4">
          {task.description && (
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Notes</p>
              <p className="font-body text-[14px] text-[#4D4D4D] leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Status</p>
              <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {statusStyle.label}
              </span>
            </div>

            {task.priority && priorityStyle && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Priority</p>
                <span style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                  {priorityLabel}
                </span>
              </div>
            )}

            {task.due_date && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Due Date</p>
                <div className="flex items-center gap-1.5 font-body text-[13px] text-[#4D4D4D]">
                  <Calendar size={13} className="text-[#AB655C]" />
                  {format(new Date(task.due_date.slice(0, 10) + 'T00:00:00'), 'MMM d, yyyy')}
                </div>
              </div>
            )}

            {task.projectTitle && task.projectId && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Project</p>
                <Link
                  href={`/projects/${task.projectId}`}
                  className="flex items-center gap-1.5 font-body text-[13px] text-[#640015] hover:underline"
                >
                  <FolderOpen size={13} /> {task.projectTitle}
                </Link>
              </div>
            )}

            {task.milestoneTitle && task.milestoneId && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Milestone</p>
                <Link
                  href={`/milestones/${task.milestoneId}`}
                  className="flex items-center gap-1.5 font-body text-[13px] text-[#640015] hover:underline"
                >
                  <Target size={13} /> {task.milestoneTitle}
                </Link>
              </div>
            )}

            {task.clientName && task.client_id && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9c9490] mb-1">Client</p>
                <Link
                  href={`/clients/${task.client_id}`}
                  className="flex items-center gap-1.5 font-body text-[13px] text-[#640015] hover:underline"
                >
                  <User size={13} /> {task.clientName}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
