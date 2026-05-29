'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Target, Calendar, ArrowLeft, Plus, FolderOpen, CheckSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MILESTONE_STATUS_STYLES } from '@/lib/constants'
import MilestoneForm from '@/components/forms/MilestoneForm'
import TaskForm from '@/components/forms/TaskForm'
import ProjectForm from '@/components/forms/ProjectForm'
import RowMenu from '@/components/shared/RowMenu'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import MilestoneProjectRow from './MilestoneProjectRow'
import MilestoneTaskRow from './MilestoneTaskRow'
import MilestoneActivityTab from './MilestoneActivityTab'
import type { MilestoneDetailRow, LinkedProject, LinkedTask, ActivityNote } from './types'

export type { MilestoneDetailRow, LinkedProject, LinkedTask, ActivityNote }


function SectionHeading({ label, count, muted, onAdd, addLabel }: {
  label: string; count: number; muted?: boolean; onAdd?: () => void; addLabel?: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className={`flex items-center gap-2 pl-3 border-l-2 ${muted ? 'border-[#574141]/30' : 'border-[#640015]'}`}>
        <h2 className={`font-headline text-[13px] uppercase tracking-wider font-semibold ${muted ? 'text-[#574141]/70' : 'text-[#4D4D4D]'}`}>
          {label}
        </h2>
        <span className="flex items-center justify-center w-5 h-5 bg-[#640015] text-[#F7F1ED] text-[10px] font-bold rounded-full">
          {count}
        </span>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-body text-[#640015] border border-[#640015]/30 rounded-lg hover:bg-[#640015]/5 transition-colors"
        >
          <Plus size={11} /> {addLabel ?? 'Add'}
        </button>
      )}
    </div>
  )
}

interface Props {
  milestone: MilestoneDetailRow
  linkedProjects: LinkedProject[]
  linkedTasks: LinkedTask[]
  activityNotes: ActivityNote[]
}

export default function MilestoneDetail({ milestone, linkedProjects, linkedTasks, activityNotes }: Props) {
  const router = useRouter()
  const [tab,          setTab]         = useState<'overview' | 'activity'>('overview')
  const [editOpen,     setEditOpen]    = useState(false)
  const [deleteOpen,   setDeleteOpen]  = useState(false)
  const [addTaskOpen,  setAddTaskOpen] = useState(false)
  const [addProjOpen,  setAddProjOpen] = useState(false)
  const [addNoteOpen,  setAddNoteOpen] = useState(false)

  const [editing,        setEditing]        = useState(false)
  const [editDesc,       setEditDesc]       = useState(milestone.description ?? '')
  const [editStatus,     setEditStatus]     = useState(milestone.status)
  const [editTargetDate, setEditTargetDate] = useState(
    milestone.target_date ? new Date(milestone.target_date).toLocaleDateString('en-CA') : ''
  )

  const handleSaveDetails = async () => {
    await supabase.from('milestones').update({
      description: editDesc || null,
      status: editStatus,
      target_date: editTargetDate || null,
    }).eq('id', milestone.id)
    setEditing(false)
    router.refresh()
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditDesc(milestone.description ?? '')
    setEditStatus(milestone.status)
    setEditTargetDate(milestone.target_date ? new Date(milestone.target_date).toLocaleDateString('en-CA') : '')
  }

  const style      = MILESTONE_STATUS_STYLES[milestone.status] ?? MILESTONE_STATUS_STYLES.upcoming
  const isComplete = milestone.status === 'achieved'
  const dateLabel  = isComplete && milestone.completed_at
    ? `Completed ${format(new Date(milestone.completed_at), 'MMM yyyy')}`
    : milestone.target_date
    ? `Target: ${format(new Date(milestone.target_date), 'MMM yyyy')}`
    : null

  const totalTasks     = linkedTasks.length
  const completedCount = linkedTasks.filter(t => t.status === 'completed').length
  const progressPct    = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  const openTasks      = linkedTasks.filter(t => t.status !== 'completed' && t.status !== 'abandoned')
  const doneTasks      = linkedTasks.filter(t => t.status === 'completed')

  const handleDelete = async () => {
    await supabase.from('milestones').delete().eq('id', milestone.id)
    setDeleteOpen(false)
    router.push('/milestones')
  }

  const chipBase: React.CSSProperties = {
    padding: '8px 16px', backgroundColor: '#F7F1ED', border: '1px solid #E8E0DC',
    borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-body)',
    display: 'flex', alignItems: 'center', gap: 8, color: '#9c9490',
  }

  const btnStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
    border: 'none', backgroundColor: '#640015', color: 'white',
    cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ padding: '24px 40px' }}>
      <MilestoneForm isOpen={editOpen} onClose={() => setEditOpen(false)}
        initialData={{ id: milestone.id, title: milestone.title, description: milestone.description, status: milestone.status, target_date: milestone.target_date }} />
      <ConfirmDelete isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} itemName={milestone.title} entityType="Milestone" />
      <TaskForm isOpen={addTaskOpen} onClose={() => setAddTaskOpen(false)} prefillMilestoneId={milestone.id} />
      <ProjectForm isOpen={addProjOpen} onClose={() => setAddProjOpen(false)} prefillMilestoneId={milestone.id} />

      <Link href="/milestones" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9c9490', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to Milestones
      </Link>

      {/* Header block */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#640015', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Target size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: '#4D4D4D', margin: '0 0 6px 0', lineHeight: 1.2 }}>
                {milestone.title}
              </h1>
              <span style={{ backgroundColor: style.bg, color: style.text, fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {style.label}
              </span>
            </div>
          </div>

          {editing ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9c9490', display: 'block', marginBottom: 4 }}>Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ fontSize: 13, fontFamily: 'var(--font-body)', padding: '7px 10px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'var(--background)', color: 'var(--foreground)', width: '100%', outline: 'none' }}>
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="achieved">Complete</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9c9490', display: 'block', marginBottom: 4 }}>Target Date</label>
                  <input type="date" value={editTargetDate} onChange={e => setEditTargetDate(e.target.value)} style={{ fontSize: 13, fontFamily: 'var(--font-body)', padding: '7px 10px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'var(--background)', color: 'var(--foreground)', width: '100%', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9c9490', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} style={{ fontSize: 13, fontFamily: 'var(--font-body)', padding: '7px 10px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'var(--background)', color: 'var(--foreground)', width: '100%', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dateLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> {dateLabel}
                </div>
              )}
              {milestone.description && (
                <p style={{ margin: 0, fontSize: 14, color: '#574141', lineHeight: 1.6, maxWidth: 540 }}>{milestone.description}</p>
              )}
            </div>
          )}
        </div>

        <div style={{ paddingTop: 8, flexShrink: 0 }}>
          <RowMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      {/* Info chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div style={chipBase}><FolderOpen size={14} /> {linkedProjects.length} {linkedProjects.length === 1 ? 'Project' : 'Projects'}</div>
        <div style={chipBase}><CheckSquare size={14} /> {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}</div>
        {totalTasks > 0 && (
          <div style={{ ...chipBase, color: '#AB655C' }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 56, height: 4, borderRadius: 99, backgroundColor: '#E8E0DC', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progressPct}%`, backgroundColor: '#640015', borderRadius: 99 }} />
            </span>
            {progressPct}% complete
          </div>
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
        <div style={{ paddingBottom: 12, display: 'flex', gap: 8 }}>
          {tab === 'overview' && !editing && (
            <button onClick={() => setEditing(true)} style={{ ...btnStyle, backgroundColor: 'transparent', color: '#640015', border: '1px solid #640015' }}>Edit Details</button>
          )}
          {tab === 'overview' && editing && (
            <>
              <button onClick={cancelEdit} style={{ ...btnStyle, backgroundColor: 'transparent', color: '#574141', border: '1px solid #E8E0DC' }}>Cancel</button>
              <button onClick={handleSaveDetails} style={btnStyle}>Save</button>
            </>
          )}
          {tab === 'activity' && (
            <button onClick={() => setAddNoteOpen(true)} style={btnStyle}>Log Note</button>
          )}
        </div>
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div>
          <div style={{ marginBottom: 40 }}>
            <SectionHeading label="Projects" count={linkedProjects.length} onAdd={() => setAddProjOpen(true)} addLabel="Add Project" />
            {linkedProjects.length === 0
              ? <div className="border border-dashed border-[#E8E0DC] rounded-lg p-6 text-center text-[13px] italic text-[#574141] font-body">No projects linked</div>
              : <div className="flex flex-col gap-2">{linkedProjects.map(p => <MilestoneProjectRow key={p.id} project={p} />)}</div>
            }
          </div>

          <div>
            <SectionHeading label="Tasks" count={linkedTasks.length} onAdd={() => setAddTaskOpen(true)} addLabel="Add Task" />
            {linkedTasks.length === 0
              ? <div className="border border-dashed border-[#E8E0DC] rounded-lg p-6 text-center text-[13px] italic text-[#574141] font-body">No tasks linked to this milestone</div>
              : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-3 pl-3 border-l-2 border-[#640015]/40">
                      <span className="font-body text-[12px] text-[#574141]/60 uppercase tracking-wider">Open · {openTasks.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {openTasks.length === 0
                        ? <p className="text-[13px] italic text-[#574141]/50 font-body">No open tasks</p>
                        : openTasks.map(t => <MilestoneTaskRow key={t.id} task={t} milestoneId={milestone.id} />)
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
                        : doneTasks.map(t => <MilestoneTaskRow key={t.id} task={t} milestoneId={milestone.id} />)
                      }
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <MilestoneActivityTab
          milestoneId={milestone.id}
          notes={activityNotes}
          addOpen={addNoteOpen}
          onAddClose={() => setAddNoteOpen(false)}
        />
      )}
    </div>
  )
}
