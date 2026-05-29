import Link from 'next/link'
import { ArrowRight, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { daysSince, formatRelative, formatCents } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import PackageBadge from '@/components/prosper/PackageBadge'
import type { Client } from '@/lib/supabase'

async function getProsperData() {
  try {
    const [clientsRes, revenueRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('startup_id', PROSPER_STARTUP_ID)
        .order('name', { ascending: true }),
      supabase
        .from('interactions')
        .select('amount_cents')
        .eq('startup_id', PROSPER_STARTUP_ID)
        .eq('interaction_type', 'stripe_payment')
        .gte('occurred_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    const clients = clientsRes.data ?? []
    const payments = revenueRes.data ?? []
    const mtdRevenue = payments.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)

    return { clients, mtdRevenue }
  } catch {
    return { clients: [], mtdRevenue: 0 }
  }
}

const STATUS_VARIANTS: Record<string, 'active' | 'prospect' | 'inactive' | 'closed' | 'default'> = {
  active: 'active',
  prospect: 'prospect',
  inactive: 'inactive',
  closed: 'closed',
}

function ClientSummaryRow({ client }: { client: Client }) {
  const days = daysSince(client.last_contacted_at)
  const isOverdue = days !== null && days > 14

  return (
    <Link
      href={`/prosper/clients/${client.id}`}
      className="flex items-center gap-3 rounded-lg p-3 transition-opacity hover:opacity-80"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: '#f0e8e4', color: 'var(--primary)' }}
      >
        {client.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
          {client.name}
        </p>
        <div className="mt-0.5">
          <PackageBadge client={client} compact />
        </div>
      </div>
      {isOverdue && (
        <AlertTriangle size={14} style={{ color: '#991b1b', flexShrink: 0 }} />
      )}
      <div className="text-right shrink-0">
        <p className="text-xs" style={{ color: isOverdue ? '#991b1b' : 'var(--muted-foreground)' }}>
          {days !== null ? formatRelative(client.last_contacted_at) : 'Never'}
        </p>
      </div>
    </Link>
  )
}

export default async function ProsperPage() {
  const { clients, mtdRevenue } = await getProsperData()

  const activeClients = clients.filter((c) => c.status === 'active' || c.client_type === 'client')
  const leads = clients.filter((c) => c.status === 'prospect' || c.client_type === 'lead')
  const activeIds = new Set(activeClients.map((c) => c.id))
  const leadsOnly = leads.filter((c) => !activeIds.has(c.id))

  const expiringClients = activeClients.filter((c) => {
    if (!c.package_expiry_date) return false
    const days = Math.ceil((new Date(c.package_expiry_date).getTime() - Date.now()) / 86400000)
    return days >= 0 && days <= 30
  })

  const overdueClients = clients.filter((c) => {
    const days = daysSince(c.last_contacted_at)
    return days === null || days > 14
  })

  return (
    <div className="min-h-full px-8 py-6">
      <div className="mb-6">
        <h1
          className="font-headline font-bold text-[36px] text-[#4D4D4D]"
        >
          Prosper with Em
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Finance coaching overview
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Clients', value: activeClients.length },
          { label: 'Leads', value: leadsOnly.length },
          { label: 'MTD Revenue', value: formatCents(mtdRevenue) },
          { label: 'Need Follow-up', value: overdueClients.length, alert: overdueClients.length > 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {stat.label}
            </p>
            <p
              className="mt-1 text-2xl font-semibold"
              style={{
                color: stat.alert ? '#991b1b' : 'var(--foreground)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active clients */}
        <div
          className="rounded-xl border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Active Clients
            </h2>
            <Link
              href="/prosper/clients"
              className="flex items-center gap-1 text-xs hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="p-2">
            {activeClients.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                No active clients yet.
              </p>
            ) : (
              activeClients.map((c) => <ClientSummaryRow key={c.id} client={c} />)
            )}
          </div>
        </div>

        {/* Leads */}
        <div
          className="rounded-xl border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Leads
            </h2>
            <Link
              href="/prosper/clients"
              className="flex items-center gap-1 text-xs hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="p-2">
            {leadsOnly.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                No leads yet.
              </p>
            ) : (
              leadsOnly.map((c) => (
                <Link
                  key={c.id}
                  href={`/prosper/clients/${c.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#f0e8e4', color: 'var(--primary)' }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {c.name}
                    </p>
                    {c.email && (
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {c.email}
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    label={c.status ?? 'prospect'}
                    variant={STATUS_VARIANTS[c.status ?? ''] ?? 'default'}
                  />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Expiring packages */}
        {expiringClients.length > 0 && (
          <div
            className="rounded-xl border lg:col-span-2"
            style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: '#fed7aa' }}>
              <AlertTriangle size={14} style={{ color: '#9a3412' }} />
              <h2 className="text-sm font-semibold" style={{ color: '#9a3412' }}>
                Packages Expiring Within 30 Days
              </h2>
            </div>
            <div className="p-2">
              {expiringClients.map((c) => (
                <ClientSummaryRow key={c.id} client={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
