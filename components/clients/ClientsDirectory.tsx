'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { PIPELINE_STAGES, SERVICE_TYPES, CLIENT_STAGE_STYLES } from '@/lib/constants'
import { formatRelative, daysSince } from '@/lib/utils'
import FilterDropdown from '@/components/shared/FilterDropdown'
import ClientForm from '@/components/forms/ClientForm'
import RowMenu from '@/components/shared/RowMenu'
import { deleteClient } from '@/lib/deleteClient'
import type { ClientRow } from './types'

interface Props {
  clients: ClientRow[]
}


const STAGE_OPTIONS = PIPELINE_STAGES.map(s => ({ value: s.value, label: s.label }))
const PACKAGE_OPTIONS = SERVICE_TYPES.map(s => ({ value: s.value, label: s.label }))

function StagePill({ stage }: { stage: string }) {
  const style = CLIENT_STAGE_STYLES[stage] ?? { bg: '#f4f4f5', text: '#52525b' }
  const label = PIPELINE_STAGES.find(s => s.value === stage)?.label ?? stage
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
      backgroundColor: style.bg, color: style.text,
      fontFamily: 'var(--font-body)', letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function ClientDirectoryRow({ client, onDelete }: { client: ClientRow; onDelete: (id: string) => void }) {
  const router = useRouter()
  const days = daysSince(client.last_contacted)
  const isOverdue = days !== null && days > 14
  const initial = (client.first_name || client.name || '?').charAt(0).toUpperCase()
  const displayName = client.first_name || client.last_name
    ? `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()
    : client.name

  return (
    <div
      onClick={() => router.push(`/clients/${client.id}`)}
      style={{ display: 'flex', alignItems: 'center', gap: 16, backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 10, padding: '12px 16px', transition: 'box-shadow 0.15s ease', cursor: 'pointer' }}
      className="hover:shadow-sm"
    >
      {/* Avatar */}
      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f0e8e4', color: '#640015', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
        {initial}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#1b1c1c', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displayName}
        </p>
        {client.email && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9c9490', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {client.email}
          </p>
        )}
      </div>

      {/* Stage pill */}
      <StagePill stage={client.lead_stage} />

      {/* Last contact */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
        {client.last_contacted ? (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: isOverdue ? '#b91c1c' : '#9c9490' }}>
            {isOverdue && '⚠ '}{formatRelative(client.last_contacted)}
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b91c1c' }}>Never contacted</span>
        )}
      </div>

      {/* Row menu */}
      <RowMenu
        onEdit={() => router.push(`/clients/${client.id}`)}
        onDelete={() => onDelete(client.id)}
      />
    </div>
  )
}

export default function ClientsDirectory({ clients: initialClients }: Props) {
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [packageFilter, setPackageFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter(c => {
      const name = `${c.first_name ?? ''} ${c.last_name ?? ''} ${c.name ?? ''}`.toLowerCase()
      const email = (c.email ?? '').toLowerCase()
      if (q && !name.includes(q) && !email.includes(q)) return false
      if (stageFilter && c.lead_stage !== stageFilter) return false
      if (packageFilter && c.service_type !== packageFilter) return false
      return true
    })
  }, [clients, search, stageFilter, packageFilter])

  const handleDelete = async (id: string) => {
    const target = clients.find(c => c.id === id)
    const name = target
      ? `${target.first_name ?? ''} ${target.last_name ?? ''}`.trim() || target.name
      : 'this contact'
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    setDeleteError(null)
    setClients(prev => prev.filter(c => c.id !== id))
    const err = await deleteClient(id)
    if (err) {
      setClients(initialClients)
      setDeleteError(`Delete failed: ${err}`)
    }
  }

  return (
    <div className="p-8 md:p-10 mb-10">
      <ClientForm isOpen={showAdd} onClose={() => setShowAdd(false)} />

      {/* Page header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Clients</h1>
          <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">All your contacts in one place.</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <div style={{ position: 'relative', width: 220 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#574141', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: 'white', border: '1px solid #debfbf', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font-body)', color: '#1b1c1c', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <FilterDropdown value={stageFilter} onChange={setStageFilter} options={STAGE_OPTIONS} placeholder="All stages" />
          <FilterDropdown value={packageFilter} onChange={setPackageFilter} options={PACKAGE_OPTIONS} placeholder="All packages" />
        </div>
      </div>

      {/* Delete error */}
      {deleteError && (
        <div style={{ marginBottom: 16, padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          {deleteError}
        </div>
      )}

      {/* Client list */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => <ClientDirectoryRow key={c.id} client={c} onDelete={handleDelete} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9c9490', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          {clients.length === 0 ? 'No clients yet. Add your first client to get started.' : 'No clients match your filters.'}
        </div>
      )}
    </div>
  )
}
