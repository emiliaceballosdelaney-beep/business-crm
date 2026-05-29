'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { FolderOpen, Calendar, Target, User, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import RowMenu from '@/components/shared/RowMenu'
import ProjectForm from '@/components/forms/ProjectForm'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import { PROJECT_STATUS_STYLES } from '@/lib/constants'

export type ProjectCard = {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  client_id: string | null
  clientName: string | null
  milestoneTitle: string | null
  totalTasks: number
  openTasks: number
  progressPct: number
}


function ExpandRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(87,65,65,0.6)', flexShrink: 0, minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>{value}</span>
    </div>
  )
}

export default function ProjectCardComponent({ card }: { card: ProjectCard }) {
  const router = useRouter()
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded, setExpanded]     = useState(false)
  const style      = PROJECT_STATUS_STYLES[card.status] ?? PROJECT_STATUS_STYLES.active
  const isComplete = card.status === 'complete'

  const handleDelete = async () => {
    await supabase.from('projects').delete().eq('id', card.id)
    setDeleteOpen(false)
    router.refresh()
  }

  const dateLabel = card.due_date
    ? `${isComplete ? 'Due was' : 'Due'} ${format(new Date(card.due_date), 'MMM d')}`
    : null

  return (
    <div
      className={`rounded-xl border border-[#E8E0DC] shadow-sm flex flex-col p-4 bg-white cursor-pointer transition-all ${
        isComplete ? 'hover:border-[#AB655C]/40' : 'hover:border-[#AB655C]'
      }`}
      onClick={() => router.push(`/projects/${card.id}`)}
    >
      <ProjectForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: card.id, title: card.title, client_id: card.client_id, description: card.description, due_date: card.due_date, status: card.status }}
      />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={card.title}
        entityType="Project"
      />

      {/* Top row: title+description block on left, status badge on right */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col">
          <h3 className="text-[15px] font-headline font-semibold text-[#1b1c1c] flex items-center gap-2 mb-1">
            <FolderOpen size={16} className="text-[#640015] flex-shrink-0" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-[#8a7171] text-[14px] font-body mb-2 leading-relaxed line-clamp-2">{card.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3" onClick={e => e.stopPropagation()}>
          <span style={{ backgroundColor: style.bg, color: style.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            {style.label}
          </span>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      {/* Due date */}
      {dateLabel && (
        <div className="flex items-center gap-1 mb-2 text-[11px] font-label text-[#8a7171]">
          <Calendar size={12} className="flex-shrink-0" />
          {dateLabel}
        </div>
      )}

      {/* Progress bar — only when tasks exist */}
      {card.totalTasks > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-[6px] bg-[#efeded] rounded-full overflow-hidden">
            <div className="h-full bg-[#640015] rounded-full" style={{ width: `${card.progressPct}%` }} />
          </div>
          <span className="text-[11px] font-label text-[#640015] font-bold">{card.progressPct}%</span>
        </div>
      )}

      {/* Association pills */}
      {(card.milestoneTitle || card.clientName) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {card.milestoneTitle && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0EEEC] text-[#6B6360] text-[11px] font-label">
              <Target size={12} />
              {card.milestoneTitle}
            </div>
          )}
          {card.clientName && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#F9EDE8] text-[#8B4A4A] text-[11px] font-label">
              <User size={12} />
              {card.clientName}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-[#E8E0DC] flex justify-between items-center">
        <div className="text-[11px] font-label text-[#8a7171]">
          <b>{card.totalTasks} tasks</b> · {card.openTasks} open
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-label text-[#8d4c44] font-semibold">View detail →</span>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            className="text-[#8d4c44] hover:text-[#640015] transition-colors flex items-center"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expand panel */}
      {expanded && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ borderTop: '1px solid #E8E0DC', backgroundColor: '#F7F1ED', margin: '12px -16px -16px', padding: '10px 16px', borderRadius: '0 0 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {card.description && <ExpandRow label="Notes" value={card.description} />}
          {card.due_date && <ExpandRow label="Due" value={format(new Date(card.due_date), 'MMM d, yyyy')} />}
          {card.clientName && <ExpandRow label="Client" value={card.clientName} />}
          {card.milestoneTitle && <ExpandRow label="Milestone" value={card.milestoneTitle} />}
        </div>
      )}
    </div>
  )
}
