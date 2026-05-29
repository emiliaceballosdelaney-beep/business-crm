'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import ProjectCardComponent, { type ProjectCard } from './ProjectCard'
import ProjectForm from '@/components/forms/ProjectForm'
import FilterDropdown, { type FilterOption } from '@/components/shared/FilterDropdown'

type FilterMode = 'all' | 'active' | 'on_hold' | 'complete'

const STATUS_ORDER: Record<string, number> = { active: 0, on_hold: 1, complete: 2 }

const PROJECT_FILTER_OPTIONS: FilterOption[] = [
  { value: 'active',   label: 'Active' },
  { value: 'on_hold',  label: 'On Hold' },
  { value: 'complete', label: 'Complete' },
]

interface Props {
  cards: ProjectCard[]
}

export default function ProjectsPage({ cards }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    return cards
      .filter(c => {
        if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
        if (filter !== 'all' && c.status !== filter) return false
        return true
      })
      .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99))
  }, [cards, search, filter])

  return (
    <div className="p-8 md:p-10 mb-10">
      <ProjectForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      {/* Page header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Projects</h1>
          <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">A place for everything you're actively building.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#640015] text-[#fbf9f8] font-body text-[12px] px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity border-none cursor-pointer flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#574141] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#debfbf] bg-white text-[14px] font-body text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#640015] focus:border-[#640015]"
          />
        </div>
        <FilterDropdown
          value={filter === 'all' ? '' : filter}
          onChange={v => setFilter((v || 'all') as FilterMode)}
          options={PROJECT_FILTER_OPTIONS}
          placeholder="All projects"
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#E8E0DC] rounded-lg p-8 text-center text-[13px] italic text-[#574141] font-body">
          No projects match your filter
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => <ProjectCardComponent key={c.id} card={c} />)}
        </div>
      )}
    </div>
  )
}
