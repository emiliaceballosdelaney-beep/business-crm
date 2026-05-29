import { PACKAGE_DEFINITIONS } from '@/lib/constants'
import { formatDate, sessionsRemaining } from '@/lib/utils'
import type { Client } from '@/lib/supabase'

interface PackageBadgeProps {
  client: Pick<Client, 'billing_model' | 'package_type' | 'sessions_total' | 'sessions_used' | 'package_expiry_date' | 'package_price_cents'>
  compact?: boolean
}

export default function PackageBadge({ client, compact = false }: PackageBadgeProps) {
  const { billing_model, package_type, sessions_total, sessions_used, package_expiry_date } = client

  if (!billing_model && !package_type) {
    if (compact) return null
    return (
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        No package assigned
      </span>
    )
  }

  if (billing_model === 'per_session') {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: '#fff7ed', color: '#9a3412' }}
      >
        {compact ? 'Per session' : `Per session · $${client.package_price_cents ? (client.package_price_cents / 100).toFixed(0) : '—'}/session`}
      </div>
    )
  }

  const def = package_type ? PACKAGE_DEFINITIONS[package_type as keyof typeof PACKAGE_DEFINITIONS] : null
  const remaining = sessionsRemaining(sessions_total, sessions_used ?? 0)

  const expiryDate = package_expiry_date ? new Date(package_expiry_date) : null
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0

  if (compact) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
      >
        {def?.label ?? package_type}
        {remaining !== null && ` · ${remaining} left`}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
      >
        {def?.label ?? package_type}
      </span>

      {remaining !== null && (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
        >
          {sessions_used}/{sessions_total} sessions used
        </span>
      )}

      {daysUntilExpiry !== null && (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: isExpired ? '#fef2f2' : isExpiringSoon ? '#fff7ed' : 'var(--muted)',
            color: isExpired ? '#991b1b' : isExpiringSoon ? '#9a3412' : 'var(--muted-foreground)',
          }}
        >
          {isExpired
            ? `Expired ${formatDate(package_expiry_date)}`
            : `Expires ${formatDate(package_expiry_date)} · ${daysUntilExpiry}d`}
        </span>
      )}
    </div>
  )
}
