import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Mail, Phone, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { formatDate, formatRelative, daysSince } from '@/lib/utils'
import PackageBadge from '@/components/prosper/PackageBadge'
import SessionTracker from '@/components/prosper/SessionTracker'
import InteractionTimeline from '@/components/prosper/InteractionTimeline'
import LogInteractionForm from '@/components/prosper/LogInteractionForm'
import StatusBadge from '@/components/shared/StatusBadge'
import type { Interaction } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function getClient(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('startup_id', PROSPER_STARTUP_ID)
    .single()
  if (error || !data) return null
  return data
}

async function getInteractions(clientId: string): Promise<Interaction[]> {
  const { data } = await supabase
    .from('interactions')
    .select('*')
    .eq('client_id', clientId)
    .order('occurred_at', { ascending: false })
    .limit(100)
  return data ?? []
}

async function getReferrer(referredById: string | null) {
  if (!referredById) return null
  const { data } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', referredById)
    .single()
  return data
}

const FINANCIAL_STAGE_LABELS: Record<string, string> = {
  emergency_fund: 'Emergency Fund',
  debt_payoff: 'Debt Payoff',
  investing: 'Investing',
  goals: 'Goal Saving',
}

const STATUS_VARIANTS: Record<string, 'active' | 'prospect' | 'inactive' | 'closed' | 'default'> = {
  active: 'active',
  prospect: 'prospect',
  inactive: 'inactive',
  closed: 'closed',
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [client, interactions] = await Promise.all([
    getClient(id),
    getInteractions(id),
  ])

  if (!client) notFound()

  const referrer = await getReferrer(client.referred_by)
  const daysSinceContact = daysSince(client.last_contacted_at)
  const isProsper = client.startup_id === PROSPER_STARTUP_ID

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-3"
        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <Link
          href="/prosper/clients"
          className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ChevronLeft size={15} />
          Clients
        </Link>
        <LogInteractionForm
          clientId={client.id}
          startupId={client.startup_id}
        />
      </div>

      <div className="px-8 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-light"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}
              >
                {client.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={client.status ?? 'prospect'}
                  variant={STATUS_VARIANTS[client.status ?? ''] ?? 'default'}
                />
                {client.financial_stage && (
                  <StatusBadge
                    label={FINANCIAL_STAGE_LABELS[client.financial_stage] ?? client.financial_stage}
                    variant="default"
                  />
                )}
                {daysSinceContact !== null && (
                  <span className="text-xs" style={{ color: daysSinceContact > 14 ? '#991b1b' : 'var(--muted-foreground)' }}>
                    Last contact {formatRelative(client.last_contacted_at)}
                    {daysSinceContact > 14 && ' ⚠'}
                  </span>
                )}
                {daysSinceContact === null && (
                  <span className="text-xs" style={{ color: '#9a3412' }}>Never contacted</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-4 flex flex-wrap gap-4">
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--foreground)' }}
              >
                <Mail size={13} style={{ color: 'var(--muted-foreground)' }} />
                {client.email}
              </a>
            )}
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--foreground)' }}
              >
                <Phone size={13} style={{ color: 'var(--muted-foreground)' }} />
                {client.phone}
              </a>
            )}
          </div>
        </div>

        {/* Package section — Prosper only */}
        {isProsper && (
          <div
            className="mb-6 rounded-xl border p-5"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2
              className="mb-4 text-sm font-semibold"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
            >
              Package & Sessions
            </h2>
            <div className="flex flex-col gap-4">
              <PackageBadge client={client} />
              <SessionTracker
                total={client.sessions_total}
                used={client.sessions_used ?? 0}
              />
              {client.package_start_date && (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Started {formatDate(client.package_start_date)}
                  {client.package_expiry_date && ` · Expires ${formatDate(client.package_expiry_date)}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Referral info */}
        {(referrer || client.referred_by !== null) && (
          <div
            className="mb-6 rounded-xl border p-4 flex items-center justify-between"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Referred by
              </p>
              {referrer ? (
                <Link
                  href={`/prosper/clients/${referrer.id}`}
                  className="flex items-center gap-1 text-sm font-medium mt-0.5 hover:opacity-70"
                  style={{ color: 'var(--primary)' }}
                >
                  {referrer.name}
                  <ExternalLink size={11} />
                </Link>
              ) : (
                <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>—</p>
              )}
            </div>
          </div>
        )}

        {/* Notes field */}
        {client.notes && (
          <div
            className="mb-6 rounded-xl border p-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <p className="mb-1 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
              {client.notes}
            </p>
          </div>
        )}

        {/* Interaction timeline */}
        <div>
          <h2
            className="mb-4 text-sm font-semibold"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-body)' }}
          >
            Interaction History
            <span className="ml-2 font-normal" style={{ color: 'var(--muted-foreground)' }}>
              {interactions.length} logged
            </span>
          </h2>
          <InteractionTimeline interactions={interactions} />
        </div>
      </div>
    </div>
  )
}
