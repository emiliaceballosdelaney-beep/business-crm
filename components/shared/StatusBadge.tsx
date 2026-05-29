import { cn } from '@/lib/utils'

type BadgeVariant = 'active' | 'prospect' | 'inactive' | 'closed' | 'pending' | 'overdue' | 'today' | 'soon' | 'success' | 'default'

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  active:   { bg: '#f0fdf4', color: '#166534' },
  prospect: { bg: '#fff7ed', color: '#9a3412' },
  inactive: { bg: '#f9fafb', color: '#6b7280' },
  closed:   { bg: '#fef2f2', color: '#991b1b' },
  pending:  { bg: '#fefce8', color: '#713f12' },
  overdue:  { bg: '#fef2f2', color: '#991b1b' },
  today:    { bg: '#fff7ed', color: '#9a3412' },
  soon:     { bg: '#fef9c3', color: '#713f12' },
  success:  { bg: '#f0fdf4', color: '#166534' },
  default:  { bg: 'var(--muted)', color: 'var(--muted-foreground)' },
}

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

export default function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  const { bg, color } = VARIANT_STYLES[variant]
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  )
}
