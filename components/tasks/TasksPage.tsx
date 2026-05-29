'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Plus, Search, Check, FolderOpen, User, Target, ChevronDown } from 'lucide-react'
import { PRIORITY_COLORS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { logTaskActivity } from '@/lib/autoLogActivity'
import TaskForm from '@/components/forms/TaskForm'
import RowMenu from '@/components/shared/RowMenu'
import ConfirmDelete from '@/components/modals/ConfirmDelete'
import FilterDropdown from '@/components/shared/FilterDropdown'
import TaskExpandPanel from '@/components/tasks/TaskExpandPanel'

export type TaskItem = {
  id: string
  title: string
  status: string
  priority: string
  description: string | null
  due_date: string | null
  created_at: string | null
  completed_at: string | null
  client_id: string | null
  project: { title: string } | null
  client: { name: string } | null
  milestone: { title: string } | null
}

interface Props {
  tasks: TaskItem[]
  projectNames: string[]
}

function AssocPill({ type, label }: { type: 'project' | 'client' | 'milestone'; label: string }) {
  const cfg = {
    project:   { bg: '#F5DCE0', color: '#640015', Icon: FolderOpen },
    client:    { bg: '#F9EDE8', color: '#8B4A4A', Icon: User },
    milestone: { bg: '#F0EEEC', color: '#6B6360', Icon: Target },
  }[type]
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-label rounded-sm" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <cfg.Icon size={12} />
      {label}
    </span>
  )
}

function SectionHeading({ label, count, muted }: { label: string; count: number; muted?: boolean }) {
  return (
    <div className={`flex items-center gap-2 mb-4 pl-3 border-l-2 ${muted ? 'border-[#574141]/30' : 'border-[#640015]'}`}>
      <h2 className={`font-headline text-[13px] uppercase tracking-wider font-semibold ${muted ? 'text-[#574141]/70' : 'text-[#4D4D4D]'}`}>
        {label}
      </h2>
      <span className="flex items-center justify-center w-5 h-5 bg-[#640015] text-[#F7F1ED] text-[10px] font-bold rounded-full">
        {count}
      </span>
    </div>
  )
}

function TaskRow({ task, completed = false }: { task: TaskItem; completed?: boolean }) {
  const router = useRouter()
  const [toggling,   setToggling]   = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [expanded,   setExpanded]   = useState(false)

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
    <div className={`bg-white border border-[#E8E0DC] shadow-sm ${expanded ? 'rounded-t-[10px]' : 'rounded-[10px]'}`}>
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
        className="p-[12px] flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Checkbox */}
        <div
          onClick={e => { e.stopPropagation(); handleToggle() }}
          className={`w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer transition-opacity ${toggling ? 'opacity-50' : ''} ${
            completed ? 'bg-[#640015]' : 'border-2 border-[#640015]'
          }`}
        >
          {completed && <Check size={12} className="text-[#F7F1ED]" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-label text-[13px] ${completed ? 'text-[#574141]/70 line-through' : 'text-[#4D4D4D]'}`}>
            {task.title}
          </p>
          {(task.project || task.client || task.milestone) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {task.project   && <AssocPill type="project"   label={task.project.title} />}
              {task.client    && <AssocPill type="client"    label={task.client.name} />}
              {task.milestone && <AssocPill type="milestone" label={task.milestone.title} />}
            </div>
          )}
        </div>

        {/* Right side — due left, priority right */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {task.due_date && !completed && (() => {
            const dueDate = new Date(task.due_date.slice(0, 10) + 'T00:00:00')
            const urgent = dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            return (
              <span className={`font-label text-[11px] ${urgent ? 'text-red-600 font-semibold' : 'text-[#8d4c44]'}`}>
                Due {format(dueDate, 'MMM d')}
              </span>
            )
          })()}
          {(() => { const p = PRIORITY_COLORS[task.priority]; return p && !completed ? (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', fontWeight: 600, backgroundColor: p.bg, color: p.text }}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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


export default function TasksPage({ tasks, projectNames }: Props) {
  const [search, setSearch]                   = useState('')
  const [clientFilter, setClientFilter]       = useState('')
  const [milestoneFilter, setMilestoneFilter] = useState('')
  const [projectFilter, setProjectFilter]     = useState('')
  const [priorityFilter, setPriorityFilter]   = useState('')
  const [showAdd, setShowAdd]                 = useState(false)

  const clientNames = useMemo(() =>
    Array.from(new Set(tasks.filter(t => t.client).map(t => t.client!.name))).sort()
  , [tasks])

  const milestoneNames = useMemo(() =>
    Array.from(new Set(tasks.filter(t => t.milestone).map(t => t.milestone!.title))).sort()
  , [tasks])

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (clientFilter    && t.client?.name       !== clientFilter)    return false
      if (milestoneFilter && t.milestone?.title   !== milestoneFilter) return false
      if (projectFilter   && t.project?.title     !== projectFilter)   return false
      if (priorityFilter  && t.priority           !== priorityFilter)  return false
      return true
    })
  }, [tasks, search, clientFilter, milestoneFilter, projectFilter, priorityFilter])

  const open = filtered.filter(t => t.status !== 'completed' && t.status !== 'abandoned')
  const done = filtered.filter(t => t.status === 'completed')

  return (
    <div className="p-8 md:p-10 mb-10">
      <TaskForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      {/* Page header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Tasks</h1>
          <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">Action items across all your projects and clients.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#640015] text-[#fbf9f8] font-body text-[12px] px-4 py-2 rounded-[6px] flex items-center gap-2 hover:opacity-90 transition-opacity border-none cursor-pointer flex-shrink-0"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#574141] pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#debfbf] rounded-lg font-body text-[14px] text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#640015] focus:border-[#640015]"
          />
        </div>
        <div className="flex items-center gap-3">
          <FilterDropdown value={priorityFilter}  onChange={setPriorityFilter}  options={[{ value: 'urgent', label: 'Urgent' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} placeholder="All priorities" />
          <FilterDropdown value={clientFilter}    onChange={setClientFilter}    options={clientNames.map(n => ({ value: n, label: n }))}      placeholder="All clients" />
          <FilterDropdown value={milestoneFilter} onChange={setMilestoneFilter} options={milestoneNames.map(n => ({ value: n, label: n }))}   placeholder="All milestones" />
          <FilterDropdown value={projectFilter}   onChange={setProjectFilter}   options={projectNames.map(n => ({ value: n, label: n }))}     placeholder="All projects" />
        </div>
      </div>

      {/* Two-column grid: Open | Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <SectionHeading label="Open" count={open.length} />
          <div className="flex flex-col gap-2">
            {open.length === 0 ? (
              <div className="border border-dashed border-[#E8E0DC] rounded-lg p-5 text-center text-[13px] italic text-[#574141] font-body">
                No open tasks
              </div>
            ) : open.map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        </div>

        <div>
          <SectionHeading label="Complete" count={done.length} muted />
          <div className="flex flex-col gap-2">
            {done.length === 0 ? (
              <div className="border border-dashed border-[#E8E0DC] rounded-lg p-5 text-center text-[13px] italic text-[#574141] font-body">
                No completed tasks
              </div>
            ) : done.map(t => <TaskRow key={t.id} task={t} completed />)}
          </div>
        </div>
      </div>
    </div>
  )
}
