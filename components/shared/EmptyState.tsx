import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 text-center', className)}>
      {Icon && (
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <Icon size={18} style={{ color: 'var(--muted-foreground)' }} />
        </div>
      )}
      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        {title}
      </p>
      {description && (
        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
