'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, CloudOff } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import ClientCard from './ClientCard'
import type { ClientRow, NextMeeting } from './types'
import { PIPELINE_STAGES, SERVICE_TYPES } from '@/lib/constants'
import ClientForm from '@/components/forms/ClientForm'
import FilterDropdown from '@/components/shared/FilterDropdown'

interface Props {
  clients: ClientRow[]
  nextMeetingByClient: Record<string, NextMeeting>
}

const STAGE_OPTIONS = PIPELINE_STAGES.map(s => ({ value: s.value, label: s.label }))
const PACKAGE_OPTIONS = SERVICE_TYPES.map(s => ({ value: s.value, label: s.label }))

function DraggableCard({ client, nextMeeting }: { client: ClientRow; nextMeeting?: NextMeeting }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: client.id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0 : 1, cursor: 'grab', touchAction: 'none' }}
    >
      <ClientCard client={client} nextMeeting={nextMeeting} />
    </div>
  )
}

function DroppableColumn({
  stage,
  cards,
  nextMeetingByClient,
}: {
  stage: typeof PIPELINE_STAGES[number]
  cards: ClientRow[]
  nextMeetingByClient: Record<string, NextMeeting>
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.value })

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? 'rgba(100,0,21,0.04)' : '#FAFAFA',
        border: '1px solid #E8E0DC',
        borderTop: '2px solid #640015',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 200,
        outline: isOver ? '2px solid rgba(100,0,21,0.2)' : '2px solid transparent',
        outlineOffset: -1,
        transition: 'background-color 0.1s, outline-color 0.1s',
      }}
    >
      {/* Column header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#574141' }}>
          {stage.label}
        </span>
        <span style={{ backgroundColor: '#640015', color: 'white', fontSize: 10, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cards.map(c => (
          <DraggableCard key={c.id} client={c} nextMeeting={nextMeetingByClient[c.id]} />
        ))}
        {cards.length === 0 && (
          <div style={{ border: '2px dashed rgba(222,191,191,0.5)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>
            <CloudOff size={20} color="rgba(222,191,191,0.5)" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14, color: 'rgba(87,65,65,0.7)', fontFamily: 'var(--font-body)', margin: 0 }}>
              No {stage.label.toLowerCase()} clients
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClientsKanban({ clients, nextMeetingByClient }: Props) {
  const router = useRouter()
  const [liveClients, setLiveClients] = useState(clients)
  useEffect(() => { setLiveClients(clients) }, [clients])
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [packageFilter, setPackageFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [activeClient, setActiveClient] = useState<ClientRow | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filtered = useMemo(() => {
    return liveClients.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (stageFilter && c.lead_stage !== stageFilter) return false
      if (packageFilter && c.service_type !== packageFilter) return false
      return true
    })
  }, [liveClients, search, stageFilter, packageFilter])

  const byStage = useMemo(() => {
    const map: Record<string, ClientRow[]> = {}
    for (const s of PIPELINE_STAGES) map[s.value] = []
    for (const c of filtered) {
      const key = c.lead_stage ?? 'lead'
      if (map[key]) map[key].push(c)
    }
    return map
  }, [filtered])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const c = liveClients.find(c => c.id === event.active.id)
    setActiveClient(c ?? null)
  }, [liveClients])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveClient(null)
    const { active, over } = event
    if (!over) return
    const clientId = active.id as string
    const newStage = over.id as string
    const current = liveClients.find(c => c.id === clientId)
    if (!current || current.lead_stage === newStage) return

    const snapshot = liveClients
    setLiveClients(prev => prev.map(c => c.id === clientId ? { ...c, lead_stage: newStage } : c))

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_stage: newStage }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setLiveClients(snapshot)
    }
  }, [liveClients, router])

  return (
    <div className="p-8 md:p-10 mb-10">
      <ClientForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      <div>
        {/* Page header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Pipeline</h1>
            <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">Your client pipeline by stage.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-[#640015] text-[#fbf9f8] font-body text-[12px] px-4 py-2 rounded-[6px] flex items-center gap-2 hover:opacity-90 transition-opacity border-none cursor-pointer flex-shrink-0"
          >
            <Plus size={14} />
            Add Client
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16 }}>
          <div style={{ position: 'relative', width: 200 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#574141', pointerEvents: 'none', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: 'white', border: '1px solid #debfbf', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font-body)', color: '#1b1c1c', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <FilterDropdown
              value={stageFilter}
              onChange={setStageFilter}
              options={STAGE_OPTIONS}
              placeholder="All stages"
            />
            <FilterDropdown
              value={packageFilter}
              onChange={setPackageFilter}
              options={PACKAGE_OPTIONS}
              placeholder="All packages"
            />
          </div>
        </div>

        {/* Kanban columns */}
        <DndContext id="clients-kanban" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, alignItems: 'start' }}>
            {PIPELINE_STAGES.map(stage => (
              <DroppableColumn
                key={stage.value}
                stage={stage}
                cards={byStage[stage.value] ?? []}
                nextMeetingByClient={nextMeetingByClient}
              />
            ))}
          </div>
          <DragOverlay>
            {activeClient && (
              <div style={{ opacity: 0.92, transform: 'rotate(1.5deg)', cursor: 'grabbing' }}>
                <ClientCard client={activeClient} nextMeeting={nextMeetingByClient[activeClient.id]} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
