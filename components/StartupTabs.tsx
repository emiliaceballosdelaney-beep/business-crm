import { Startup } from '../lib/supabase'

interface Props {
  startups: Startup[]
  selected: string | null
  onChange: (id: string) => void
  allOption?: boolean
}

export default function StartupTabs({ startups, selected, onChange, allOption }: Props) {
  return (
    <div className="startup-tabs">
      {allOption && (
        <button
          className={`startup-tab ${selected === null ? 'active' : ''}`}
          onClick={() => onChange('')}
        >
          All
        </button>
      )}
      {startups.map((s) => (
        <button
          key={s.id}
          className={`startup-tab ${selected === s.id ? 'active' : ''}`}
          onClick={() => onChange(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  )
}
