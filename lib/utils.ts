import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMM d, yyyy')
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMM d, yyyy · h:mm a')
}

export function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  return isPast(new Date(dateStr))
}

export function sessionsRemaining(total: number | null, used: number): number | null {
  if (total === null) return null
  return Math.max(0, total - used)
}
