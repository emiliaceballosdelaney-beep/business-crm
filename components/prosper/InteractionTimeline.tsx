import {
  Phone, Mail, Calendar, DollarSign,
  CalendarCheck, Send, Linkedin, StickyNote,
} from 'lucide-react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'
import type { Interaction } from '@/lib/supabase'
import { formatCents } from '@/lib/utils'
import InteractionActions from './InteractionActions'

const TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>,
  color: string,
  bg: string,
  label: string,
}> = {
  call:             { icon: Phone,         color: '#2563eb', bg: '#eff6ff', label: 'Call' },
  email:            { icon: Mail,          color: '#6b7280', bg: '#f9fafb', label: 'Email' },
  session:          { icon: CalendarCheck, color: '#AB655C', bg: '#fdf4f3', label: 'Session' },
  note:             { icon: StickyNote,    color: '#6b7280', bg: '#f9fafb', label: 'Note' },
  stripe_payment:   { icon: DollarSign,    color: '#16a34a', bg: '#f0fdf4', label: 'Payment' },
  calendly_booking: { icon: Calendar,      color: '#0891b2', bg: '#ecfeff', label: 'Booking' },
  linkedin_message: { icon: Linkedin,      color: '#0a66c2', bg: '#eff6ff', label: 'LinkedIn' },
  outreach:         { icon: Send,          color: '#7c3aed', bg: '#f5f3ff', label: 'Outreach' },
}

function groupLabel(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isThisWeek(d)) return 'This Week'
  if (isThisMonth(d)) return format(d, 'MMMM yyyy')
  return format(d, 'MMMM yyyy')
}

interface InteractionTimelineProps {
  interactions: Interaction[]
}

export default function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          No interactions logged yet.
        </p>
      </div>
    )
  }

  // Group by date bucket
  const groups: { label: string; items: Interaction[] }[] = []
  for (const item of interactions) {
    const label = groupLabel(item.occurred_at)
    const last = groups[groups.length - 1]
    if (last?.label === label) {
      last.items.push(item)
    } else {
      groups.push({ label, items: [item] })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {group.label}
          </p>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => {
              const cfg = TYPE_CONFIG[item.interaction_type] ?? TYPE_CONFIG.note
              const Icon = cfg.icon
              return (
                <div
                  key={item.id}
                  className="group flex items-start gap-3 rounded-lg border p-3.5"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={13} style={{ color: cfg.color } as React.CSSProperties} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {item.title}
                        {item.amount_cents && (
                          <span
                            className="ml-2 text-xs font-normal"
                            style={{ color: '#16a34a' }}
                          >
                            {formatCents(item.amount_cents)}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <InteractionActions interaction={item} />
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {format(new Date(item.occurred_at), 'MMM d · h:mm a')}
                        </p>
                      </div>
                    </div>
                    {item.body && (
                      <p
                        className="mt-1 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {item.body}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
