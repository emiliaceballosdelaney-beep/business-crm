'use client'

import { ChevronDown } from 'lucide-react'

export type FilterOption = { value: string; label: string }

interface Props {
  value: string
  onChange: (v: string) => void
  options: FilterOption[]
  placeholder: string
  allLabel?: string
}

export default function FilterDropdown({ value, onChange, options, placeholder, allLabel = 'All' }: Props) {
  const active = !!value
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-4 pr-7 py-1.5 rounded-full text-[11px] font-label cursor-pointer border outline-none transition-colors"
        style={{
          backgroundColor: active ? '#640015' : '#F7F1ED',
          color: active ? '#F7F1ED' : '#8d4c44',
          borderColor: active ? '#640015' : 'rgba(222,191,191,0.5)',
        }}
      >
        <option value="">{allLabel === 'All' ? placeholder : allLabel}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: active ? '#F7F1ED' : '#8d4c44' }}
      />
    </div>
  )
}
