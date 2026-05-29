'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Target, Calendar, FolderOpen, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import RowMenu from '@/components/shared/RowMenu'
import MilestoneForm from '@/components/forms/MilestoneForm'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import { MILESTONE_STATUS_STYLES } from '@/lib/constants'

export type MilestoneCard = {
  id: string
  title: string
  description: string | null
  status: string
  target_date: string | null
  completed_at: string | null
  projectCount: number
  taskCount: number
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

export default function MilestoneCardComponent({ card }: { card: MilestoneCard }) {
  const router = useRouter()
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded, setExpanded]     = useState(false)
  const style      = MILESTONE_STATUS_STYLES[card.status] ?? MILESTONE_STATUS_STYLES.upcoming
  const isComplete  = card.status === 'achieved'
  const showProgress = card.status === 'in_progress' || card.status === 'achieved'

  const handleDelete = async () => {
    await supabase.from('milestones').delete().eq('id', card.id)
    setDeleteOpen(false)
    router.refresh()
  }

  const dateLabel = isComplete && card.completed_at
    ? `Completed ${format(new Date(card.completed_at), 'MMM yyyy')}`
    : card.target_date
    ? `Target: ${format(new Date(card.target_date), 'MMM yyyy')}`
    : null

  return (
    <div
      onClick={() => router.push(`/milestones/${card.id}`)}
      className={`bg-white border border-[#E8E0DC] rounded-[10px] p-4 shadow-sm cursor-pointer transition-all ${
        isComplete ? 'hover:border-[#AB655C]/40' : 'hover:border-[#AB655C]/60'
      }`}
    >
      <MilestoneForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{ id: card.id, title: card.title, description: card.description, status: card.status, target_date: card.target_date }}
      />
      <ConfirmDelete
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={card.title}
        entityType="Milestone"
      />

      {/* Top row */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-[#640015] flex-shrink-0" />
          <Link href={`/milestones/${card.id}`} className="font-headline text-[15px] text-[#4D4D4D] font-semibold hover:text-[#640015] transition-colors">
            {card.title}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span style={{ backgroundColor: style.bg, color: style.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            {style.label}
          </span>
          <span onClick={e => e.stopPropagation()}>
            <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
          </span>
        </div>
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-[14px] font-body text-[#574141]/70 mb-3 leading-relaxed line-clamp-2">{card.description}</p>
      )}

      {/* Date */}
      {dateLabel && (
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={14} className="text-[#574141]/50 flex-shrink-0" />
          <span className="text-[11px] font-body text-[#574141]/60">{dateLabel}</span>
        </div>
      )}

      {/* Progress bar (in_progress + achieved, only when tasks exist) */}
      {showProgress && card.taskCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-end mb-1">
            <span className="text-[10px] font-body text-[#574141]/60">{card.progressPct}%</span>
          </div>
          <div className="w-full h-[6px] bg-[#F7F1ED] rounded-full overflow-hidden">
            <div className="h-full bg-[#640015] rounded-full" style={{ width: `${card.progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#E8E0DC] pt-3 flex justify-between items-center">
        <div className="flex gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F7F1ED] border border-[#AB655C]/30 rounded-full text-[11px] font-body text-[#AB655C]">
            <FolderOpen size={12} />
            {card.projectCount} {card.projectCount === 1 ? 'Project' : 'Projects'}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F7F1ED] border border-[#AB655C]/30 rounded-full text-[11px] font-body text-[#AB655C]">
            <CheckSquare size={12} />
            {card.taskCount} Tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/milestones/${card.id}`} onClick={e => e.stopPropagation()} className="text-[12px] font-body text-[#AB655C] hover:underline">View all →</Link>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            className="text-[#AB655C] hover:text-[#640015] transition-colors flex items-center"
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
          style={{ borderTop: '1px solid #E8E0DC', backgroundColor: '#F7F1ED', margin: '12px -16px -16px', padding: '10px 16px', borderRadius: '0 0 10px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {card.description && <ExpandRow label="Notes" value={card.description} />}
          {card.target_date && <ExpandRow label="Target" value={format(new Date(card.target_date), 'MMM d, yyyy')} />}
          {card.status === 'achieved' && card.completed_at && <ExpandRow label="Completed" value={format(new Date(card.completed_at), 'MMM d, yyyy')} />}
        </div>
      )}
    </div>
  )
}
