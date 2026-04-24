interface Props {
  stage: string
  status?: string
  priority?: string
}

export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    'early-revenue': 'green',
    'pre-revenue': 'amber',
    'scaling': 'blue',
    'idea': 'muted',
    'active': 'green',
    'inactive': 'muted',
  }
  const color = map[stage] ?? 'muted'
  const labels: Record<string, string> = {
    'early-revenue': 'Early Revenue',
    'pre-revenue': 'Pre-Revenue',
    'scaling': 'Scaling',
    'idea': 'Idea',
  }
  return (
    <span className={`badge badge-${color}`}>
      {labels[stage] ?? stage}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'todo': 'muted',
    'in_progress': 'amber',
    'in-progress': 'amber',
    'done': 'green',
    'completed': 'green',
    'blocked': 'rose',
    'active': 'green',
    'inactive': 'muted',
    'churned': 'rose',
  }
  const color = map[status] ?? 'muted'
  const label = status.replace(/_/g, ' ')
  return <span className={`badge badge-${color}`}>{label}</span>
}

export function PriorityDot({ priority }: { priority: string | null }) {
  if (!priority) return <span className="item-dot item-dot-muted" />
  const map: Record<string, string> = {
    high: 'item-dot-green',
    medium: 'item-dot-amber',
    low: 'item-dot-muted',
  }
  return <span className={`item-dot ${map[priority] ?? 'item-dot-muted'}`} />
}
