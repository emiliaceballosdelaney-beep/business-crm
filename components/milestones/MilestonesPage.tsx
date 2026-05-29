'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import MilestoneCardComponent, { type MilestoneCard } from './MilestoneCard'
import MilestoneForm from '@/components/forms/MilestoneForm'
import FilterDropdown, { type FilterOption } from '@/components/shared/FilterDropdown'

type FilterMode = 'all' | 'in_progress' | 'upcoming' | 'achieved'

const STATUS_ORDER: Record<string, number> = { in_progress: 0, upcoming: 1, achieved: 2 }

const MILESTONE_FILTER_OPTIONS: FilterOption[] = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'upcoming',    label: 'Upcoming' },
  { value: 'achieved',    label: 'Complete' },
]

interface Props {
  cards: MilestoneCard[]
}

export default function MilestonesPage({ cards }: Props) {
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
      <MilestoneForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      {/* Page header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Milestones</h1>
          <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">Your big-picture business goals.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#640015] text-[#fbf9f8] font-body text-[12px] px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity border-none cursor-pointer flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={14} /> Add Milestone
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#574141] pointer-events-none" />
          <input
            type="text"
            placeholder="Search milestones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#debfbf] rounded-lg text-[14px] font-body text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#640015] focus:border-[#640015]"
          />
        </div>
        <FilterDropdown
          value={filter === 'all' ? '' : filter}
          onChange={v => setFilter((v || 'all') as FilterMode)}
          options={MILESTONE_FILTER_OPTIONS}
          placeholder="All milestones"
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#E8E0DC] rounded-lg p-8 text-center text-[13px] italic text-[#574141] font-body">
          No milestones match your filter
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => <MilestoneCardComponent key={c.id} card={c} />)}
        </div>
      )}
    </div>
  )
}
