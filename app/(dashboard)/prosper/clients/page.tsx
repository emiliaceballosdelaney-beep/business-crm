import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { daysSince, formatRelative } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import PackageBadge from '@/components/prosper/PackageBadge'
import type { Client } from '@/lib/supabase'

async function getProsperClients(): Promise<Client[]> {
  try {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('name', { ascending: true })
    return data ?? []
  } catch {
    return []
  }
}

const STATUS_VARIANTS: Record<string, 'active' | 'prospect' | 'inactive' | 'closed' | 'default'> = {
  active: 'active',
  prospect: 'prospect',
  inactive: 'inactive',
  closed: 'closed',
}

function ClientRow({ client }: { client: Client }) {
  const daysSinceContact = daysSince(client.last_contacted_at)
  const isOverdue = daysSinceContact !== null && daysSinceContact > 14

  return (
    <Link
      href={`/prosper/clients/${client.id}`}
      className="flex items-center gap-4 rounded-xl border p-4 transition-opacity hover:opacity-80"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Avatar initial */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        style={{ backgroundColor: '#f0e8e4', color: 'var(--primary)' }}
      >
        {client.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
          {client.name}
        </p>
        {client.email && (
          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
            {client.email}
          </p>
        )}
      </div>

      {/* Package badge */}
      <div className="hidden sm:block">
        <PackageBadge client={client} compact />
      </div>

      {/* Last contact */}
      <div className="text-right shrink-0">
        {daysSinceContact !== null ? (
          <p
            className="text-xs"
            style={{ color: isOverdue ? '#991b1b' : 'var(--muted-foreground)' }}
          >
            {isOverdue && '⚠ '}
            {formatRelative(client.last_contacted_at)}
          </p>
        ) : (
          <p className="text-xs" style={{ color: '#9a3412' }}>Never contacted</p>
        )}
      </div>

      {/* Status badge */}
      <StatusBadge
        label={client.status ?? 'prospect'}
        variant={STATUS_VARIANTS[client.status ?? ''] ?? 'default'}
      />
    </Link>
  )
}

export default async function ProsperClientsPage() {
  const clients = await getProsperClients()

  const activeClients = clients.filter(
    (c) => c.status === 'active' || c.client_type === 'client'
  )
  const leads = clients.filter(
    (c) => c.status === 'prospect' || c.client_type === 'lead'
  )
  // Deduplicate: if a client appears in activeClients, remove from leads
  const activeIds = new Set(activeClients.map((c) => c.id))
  const leadsOnly = leads.filter((c) => !activeIds.has(c.id))

  return (
    <div className="min-h-full px-8 py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-light"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}
          >
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {activeClients.length} active · {leadsOnly.length} leads
          </p>
        </div>
        <Link
          href="/prosper/clients/new"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          <Plus size={14} />
          Add Client
        </Link>
      </div>

      {/* Active clients */}
      {activeClients.length > 0 && (
        <section className="mb-8">
          <h2
            className="mb-3 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Active Clients
          </h2>
          <div className="flex flex-col gap-2">
            {activeClients.map((c) => (
              <ClientRow key={c.id} client={c} />
            ))}
          </div>
        </section>
      )}

      {/* Leads */}
      {leadsOnly.length > 0 && (
        <section className="mb-8">
          <h2
            className="mb-3 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Leads
          </h2>
          <div className="flex flex-col gap-2">
            {leadsOnly.map((c) => (
              <ClientRow key={c.id} client={c} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No clients yet. Add your first client to get started.
          </p>
        </div>
      )}
    </div>
  )
}
