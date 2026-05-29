'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Client } from '@/lib/supabase'
import { daysSince, formatRelative } from '@/lib/utils'

const STAGES = [
  { id: 'lead',      label: 'Lead',      color: '#9b8b87', bg: '#faf7f5' },
  { id: 'discovery', label: 'Discovery', color: '#AB655C', bg: '#fdf3f1' },
  { id: 'active',    label: 'Active',    color: '#640015', bg: '#fdf0f2' },
  { id: 'paused',    label: 'Paused',    color: '#9b8b87', bg: '#faf7f5' },
  { id: 'cold',      label: 'Cold',      color: '#c5c0be', bg: '#f7f4f2' },
]

function ClientCard({ client, isDragging = false }: { client: Client; isDragging?: boolean }) {
  const days = daysSince(client.last_contacted_at)
  const isOverdue = days === null || days > 14

  return (
    <div
      className="rounded-lg border p-3 cursor-grab select-none"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
      }}
    >
      <p className="text-sm font-medium leading-tight" style={{ color: 'var(--foreground)' }}>
        {client.name}
      </p>
      <p
        className="mt-2 text-xs"
        style={{ color: isOverdue ? '#991b1b' : 'var(--muted-foreground)' }}
      >
        {days !== null ? formatRelative(client.last_contacted_at) : 'Never contacted'}
        {isOverdue && ' ⚠'}
      </p>
    </div>
  )
}

function DraggableCard({ client }: { client: Client }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: client.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <ClientCard client={client} isDragging={isDragging} />
    </div>
  )
}

function DroppableColumn({
  stage,
  clients,
}: {
  stage: (typeof STAGES)[number]
  clients: Client[]
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 rounded-xl border p-3 min-h-48 transition-colors"
      style={{
        backgroundColor: isOver ? stage.bg : 'var(--card)',
        borderColor: isOver ? stage.color : 'var(--border)',
        minWidth: 200,
        flex: '1 1 0',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: stage.color }}>
          {stage.label}
        </p>
        <span
          className="rounded-full px-1.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: stage.bg, color: stage.color }}
        >
          {clients.length}
        </span>
      </div>
      {clients.map((c) => (
        <DraggableCard key={c.id} client={c} />
      ))}
    </div>
  )
}

export default function KanbanBoard({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [activeClient, setActiveClient] = useState<Client | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const c = clients.find((c) => c.id === event.active.id)
    setActiveClient(c ?? null)
  }, [clients])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveClient(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const clientId = active.id as string
    const newStage = over.id as string

    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, lead_stage: newStage } : c))
    )

    try {
      await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_stage: newStage }),
      })
      router.refresh()
    } catch {
      setClients(initialClients)
    }
  }, [clients, initialClients, router])

  const grouped = STAGES.reduce<Record<string, Client[]>>((acc, stage) => {
    acc[stage.id] = clients.filter((c) => (c.lead_stage ?? 'lead') === stage.id)
    return acc
  }, {})

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <DroppableColumn key={stage.id} stage={stage} clients={grouped[stage.id] ?? []} />
        ))}
      </div>
      <DragOverlay>
        {activeClient && <ClientCard client={activeClient} />}
      </DragOverlay>
    </DndContext>
  )
}
