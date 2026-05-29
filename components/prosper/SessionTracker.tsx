interface SessionTrackerProps {
  total: number | null
  used: number
}

export default function SessionTracker({ total, used }: SessionTrackerProps) {
  if (total === null) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Ongoing · per session
      </p>
    )
  }

  const remaining = Math.max(0, total - used)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-6 rounded-sm"
            style={{
              backgroundColor: i < used ? 'var(--primary)' : 'var(--border)',
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {remaining === 0
          ? 'All sessions used'
          : `${remaining} session${remaining === 1 ? '' : 's'} remaining`}
      </p>
    </div>
  )
}
