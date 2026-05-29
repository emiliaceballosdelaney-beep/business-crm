'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FolderOpen, Calendar, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import RowMenu from '@/components/shared/RowMenu'
import ProjectForm from '@/components/forms/ProjectForm'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import type { LinkedProject } from './types'
import { PROJECT_STATUS_STYLES } from '@/lib/constants'

export default function MilestoneProjectRow({ project }: { project: LinkedProject }) {
  const router = useRouter()
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const style     = PROJECT_STATUS_STYLES[project.status] ?? PROJECT_STATUS_STYLES.active
  const dateLabel = project.due_date ? format(new Date(project.due_date), 'MMM d') : null

  const handleDelete = async () => {
    await supabase.from('projects').delete().eq('id', project.id)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-[#E8E0DC] rounded-[10px] p-4 shadow-sm flex items-center gap-3">
      <ProjectForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: project.id, title: project.title, client_id: project.client_id, description: project.description, due_date: project.due_date, status: project.status }}
      />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={project.title}
        entityType="Project"
      />

      <FolderOpen size={16} className="text-[#640015] flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-headline text-[14px] font-semibold text-[#1b1c1c] truncate">{project.title}</p>
        {project.description && (
          <p className="font-body text-[12px] text-[#574141]/70 truncate mt-0.5">{project.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {project.clientName && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F9EDE8] text-[#8B4A4A] text-[11px] font-label rounded-sm">
              <User size={11} />{project.clientName}
            </span>
          )}
          {dateLabel && (
            <span className="flex items-center gap-1 text-[11px] font-label text-[#8a7171]">
              <Calendar size={11} />Due {dateLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 text-right">
        <span className="text-[11px] font-label text-[#574141]/60 whitespace-nowrap">
          {project.openTasks} open · {project.totalTasks} tasks
        </span>
        <span style={{ backgroundColor: style.bg, color: style.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
          {style.label}
        </span>
        <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
      </div>
    </div>
  )
}
