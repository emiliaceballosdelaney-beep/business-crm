'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { User, Mail, Phone, Calendar, MapPin, Briefcase, UserPlus, CheckSquare, FileText, Link2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ClientDetailRow, GoalEntry, MeetingDetailRow, TaskDetailRow } from './types'
import type { EditValues } from './ClientDetail'
import { SOURCE_OPTIONS, INCOME_SOURCE_OPTIONS, FINANCE_TOOL_CATEGORIES } from '@/lib/constants'
import AddableSelect from './AddableSelect'

interface Props {
  client: ClientDetailRow
  referredByName: string | null
  meetings: MeetingDetailRow[]
  tasks: TaskDetailRow[]
  isEditing: boolean
  editValues: EditValues
  onSwitchTab: (tab: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditChange: (field: keyof EditValues, value: any) => void
}

function safeDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function formatDollar(raw: string): string {
  if (!raw.trim()) return raw
  const stripped = raw.replace(/[$,\s]/g, '')
  const num = parseFloat(stripped)
  if (isNaN(num)) return raw
  return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const inputStyle: React.CSSProperties = {
  fontSize: 15, fontFamily: 'var(--font-body)', color: '#1b1c1c',
  border: '1px solid #debfbf', borderRadius: 6, padding: '5px 8px',
  width: '100%', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
}
const textareaStyle: React.CSSProperties = {
  fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D', lineHeight: 1.6,
  border: '1px solid #debfbf', borderRadius: 6, padding: '7px 8px',
  width: '100%', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
  resize: 'vertical', minHeight: 72,
}
const smallInputStyle: React.CSSProperties = {
  fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D',
  border: '1px solid #debfbf', borderRadius: 6, padding: '4px 8px',
  width: '100%', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
}

function ContactField({ icon, label, value, editValue, onChange, inputType = 'text' }: {
  icon: React.ReactNode; label: string; value: string | null
  editValue?: string; onChange?: (v: string) => void; inputType?: string
}) {
  return (
    <div style={{ borderLeft: '3px solid #AB655C', paddingLeft: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color: '#9c9490', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', letterSpacing: '0.05em', margin: 0, fontWeight: 500 }}>{label}</p>
      </div>
      {onChange !== undefined ? (
        <input type={inputType} value={editValue ?? ''} onChange={e => onChange(e.target.value)} style={inputStyle} />
      ) : (
        <p style={{ fontSize: 16, fontFamily: 'var(--font-body)', color: value ? '#1b1c1c' : '#9c9490', margin: 0, lineHeight: 1.6 }}>{value ?? '—'}</p>
      )}
    </div>
  )
}

function CardSubHeading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{children}</p>
    </div>
  )
}

const innerCard: React.CSSProperties = {
  backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 10, padding: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}

const catLabel: React.CSSProperties = {
  fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490',
  textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 6px 0',
}

const toolPill: React.CSSProperties = {
  backgroundColor: '#F7F1ED', border: '1px solid rgba(171,101,92,0.4)',
  fontSize: 11, padding: '4px 8px', borderRadius: 9999,
  fontFamily: 'var(--font-body)', color: '#4D4D4D',
  display: 'flex', alignItems: 'center', gap: 4,
}

function ToolDropdown({ cat, available, onSelect, onAddNew }: {
  cat: string
  available: string[]
  onSelect: (v: string) => void
  onAddNew: (v: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')
  const sel: React.CSSProperties = {
    fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D',
    border: '1px solid #debfbf', borderRadius: 6, padding: '4px 8px',
    outline: 'none', backgroundColor: 'white', width: 'auto', minWidth: 130,
  }
  const handleAdd = async () => {
    const trimmed = newVal.trim()
    if (!trimmed) return
    await onAddNew(trimmed)
    onSelect(trimmed)
    setNewVal('')
    setAdding(false)
  }
  if (adding) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          autoFocus
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewVal('') } }}
          placeholder="Type new option…"
          style={{ ...sel, width: 150 }}
        />
        <button onClick={handleAdd} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: 'none', backgroundColor: '#640015', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>Save</button>
        <button onClick={() => { setAdding(false); setNewVal('') }} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #debfbf', background: 'none', color: '#574141', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
      </div>
    )
  }
  return (
    <select value="" onChange={e => { if (e.target.value === '__add_new__') { setAdding(true) } else if (e.target.value) { onSelect(e.target.value) } }} style={sel}>
      <option value="">+ Add {cat}</option>
      {available.map(t => <option key={t} value={t}>{t}</option>)}
      <option value="__add_new__">+ Add new…</option>
    </select>
  )
}

function toolCategoryKey(cat: string): string {
  return 'finance_tools_' + cat.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

export default function OverviewTab({ client, referredByName, meetings, tasks, isEditing, editValues, onSwitchTab, onEditChange }: Props) {
  const router = useRouter()
  const goals = isEditing ? editValues.goals : (client.goals ?? [])
  const tools = isEditing ? editValues.finance_tools : (client.finance_tools ?? [])
  const now   = Date.now()

  const [clientList, setClientList]           = useState<{ id: string; name: string }[]>([])
  const [sourceCustom, setSourceCustom]       = useState<string[]>([])
  const [incomeSourceCustom, setIncomeSourceCustom] = useState<string[]>([])
  const [toolCustomByCat, setToolCustomByCat] = useState<Record<string, string[]>>({})

  useEffect(() => {
    supabase.from('clients').select('id, name').then(({ data }) => {
      if (data) setClientList(data.filter(c => c.id !== client.id))
    })
    supabase.from('dropdown_options').select('category, value').then(({ data }) => {
      if (!data) return
      setSourceCustom(data.filter(r => r.category === 'source').map(r => r.value))
      setIncomeSourceCustom(data.filter(r => r.category === 'income_source').map(r => r.value))
      const byCat: Record<string, string[]> = {}
      for (const cat of Object.keys(FINANCE_TOOL_CATEGORIES)) {
        byCat[cat] = data.filter(r => r.category === toolCategoryKey(cat)).map(r => r.value)
      }
      setToolCustomByCat(byCat)
    })
  }, [client.id])

  const allSourceOptions       = [...SOURCE_OPTIONS,       ...sourceCustom.filter(c => !(SOURCE_OPTIONS as readonly string[]).includes(c))]
  const allIncomeSourceOptions = [...INCOME_SOURCE_OPTIONS, ...incomeSourceCustom.filter(c => !(INCOME_SOURCE_OPTIONS as readonly string[]).includes(c))]

  const addDropdownOption = async (
    category: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const { error } = await supabase
      .from('dropdown_options')
      .upsert({ category, value: trimmed }, { onConflict: 'category,value' })
    if (!error) setter(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
  }

  const addToolOption = async (cat: string, value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const { error } = await supabase
      .from('dropdown_options')
      .upsert({ category: toolCategoryKey(cat), value: trimmed }, { onConflict: 'category,value' })
    if (!error) {
      setToolCustomByCat(prev => {
        const existing = prev[cat] ?? []
        return existing.includes(trimmed) ? prev : { ...prev, [cat]: [...existing, trimmed] }
      })
    }
  }

  const upcomingMeetings = meetings
    .filter(m => { const d = safeDate(m.date); return d && d.getTime() > now })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2)

  const upcomingTasks = tasks
    .filter(t => t.due_date && safeDate(t.due_date) && safeDate(t.due_date)!.getTime() > now && t.status !== 'completed' && t.status !== 'abandoned')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 3)

  const addGoal = () =>
    onEditChange('goals', [...editValues.goals, { title: '', status: 'in_progress' as const }])

  const updateGoal = (i: number, patch: Partial<GoalEntry>) =>
    onEditChange('goals', editValues.goals.map((g, idx) => idx === i ? { ...g, ...patch } : g))

  const removeGoal = (i: number) =>
    onEditChange('goals', editValues.goals.filter((_, idx) => idx !== i))

  return (
    <div>
      {/* Personal Information */}
      <div style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 12, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, color: '#1b1c1c', margin: '0 0 20px 0', lineHeight: 1.4 }}>Personal Information</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <ContactField icon={<User size={18} />} label="First Name" value={client.first_name} editValue={editValues.first_name} onChange={isEditing ? v => onEditChange('first_name', v) : undefined} />
          <ContactField icon={<User size={18} />} label="Last Name"  value={client.last_name}  editValue={editValues.last_name}  onChange={isEditing ? v => onEditChange('last_name', v)  : undefined} />

          <ContactField icon={<Phone size={18} />} label="Phone" value={client.phone} editValue={editValues.phone} onChange={isEditing ? v => onEditChange('phone', v) : undefined} inputType="tel" />
          <ContactField icon={<Mail size={18} />}  label="Email" value={client.email} editValue={editValues.email} onChange={isEditing ? v => onEditChange('email', v) : undefined} inputType="email" />

          <ContactField icon={<Calendar size={18} />} label="Start Date" value={client.start_date ? format(new Date(client.start_date + 'T12:00:00'), 'MMMM d, yyyy') : null} editValue={editValues.start_date} onChange={isEditing ? v => onEditChange('start_date', v) : undefined} inputType="date" />
          <ContactField icon={<Calendar size={18} />} label="End Date"   value={client.end_date   ? format(new Date(client.end_date   + 'T12:00:00'), 'MMMM d, yyyy') : null} editValue={editValues.end_date}   onChange={isEditing ? v => onEditChange('end_date', v)   : undefined} inputType="date" />

          <ContactField icon={<MapPin size={18} />}    label="Location"   value={client.location}   editValue={editValues.location}   onChange={isEditing ? v => onEditChange('location', v)   : undefined} />
          <ContactField icon={<Briefcase size={18} />} label="Occupation" value={client.occupation} editValue={editValues.occupation} onChange={isEditing ? v => onEditChange('occupation', v) : undefined} />

          {/* Source */}
          <div style={{ borderLeft: '3px solid #AB655C', paddingLeft: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#9c9490', display: 'flex', alignItems: 'center' }}><Link2 size={18} /></span>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', letterSpacing: '0.05em', margin: 0, fontWeight: 500 }}>Source</p>
            </div>
            {isEditing ? (
              <AddableSelect
                value={editValues.source}
                onChange={v => onEditChange('source', v)}
                options={allSourceOptions}
                onAddNew={v => addDropdownOption('source', v, setSourceCustom)}
              />
            ) : (
              <p style={{ fontSize: 16, fontFamily: 'var(--font-body)', color: client.source ? '#1b1c1c' : '#9c9490', margin: 0, lineHeight: 1.6 }}>{client.source ?? '—'}</p>
            )}
          </div>

          {/* Referred By */}
          <div style={{ borderLeft: '3px solid #AB655C', paddingLeft: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#9c9490', display: 'flex', alignItems: 'center' }}><UserPlus size={18} /></span>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', letterSpacing: '0.05em', margin: 0, fontWeight: 500 }}>Referred By</p>
            </div>
            {isEditing ? (
              <select value={editValues.referred_by} onChange={e => onEditChange('referred_by', e.target.value)} style={{ ...inputStyle, fontSize: 14 }}>
                <option value="">— None —</option>
                {clientList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <p style={{ fontSize: 16, fontFamily: 'var(--font-body)', color: referredByName ? '#1b1c1c' : '#9c9490', margin: 0, lineHeight: 1.6 }}>{referredByName ?? '—'}</p>
            )}
          </div>

          {/* Notes — full width */}
          <div style={{ gridColumn: '1 / -1', borderLeft: '3px solid #AB655C', paddingLeft: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#9c9490', display: 'flex', alignItems: 'center' }}><FileText size={18} /></span>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#9c9490', letterSpacing: '0.05em', margin: 0, fontWeight: 500 }}>Notes</p>
            </div>
            {isEditing ? (
              <textarea value={editValues.notes} onChange={e => onEditChange('notes', e.target.value)} placeholder="Anything else worth remembering…" style={textareaStyle} />
            ) : (
              <p style={{ fontSize: 16, fontFamily: 'var(--font-body)', color: client.notes ? '#1b1c1c' : '#9c9490', margin: 0, lineHeight: 1.6 }}>
                {client.notes ?? <em>—</em>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 12, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, color: '#1b1c1c', margin: '0 0 16px 0', lineHeight: 1.4 }}>Financial Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Income & Assets */}
          <div style={innerCard}>
            <CardSubHeading icon="💰">Income &amp; Assets</CardSubHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* Income Range — dollar format */}
              <div>
                <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Income Range</p>
                {isEditing ? (
                  <input
                    value={editValues.income_range}
                    onChange={e => onEditChange('income_range', e.target.value)}
                    onBlur={e => onEditChange('income_range', formatDollar(e.target.value))}
                    placeholder="e.g. 75000"
                    style={smallInputStyle}
                  />
                ) : (
                  <p style={{ fontSize: 14, fontFamily: 'var(--font-heading)', color: '#4D4D4D', margin: 0 }}>
                    {client.income_range ? formatDollar(client.income_range) : '—'}
                  </p>
                )}
              </div>

              {/* Income Source — addable dropdown */}
              <div>
                <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Income Source</p>
                {isEditing ? (
                  <AddableSelect
                    value={editValues.income_source}
                    onChange={v => onEditChange('income_source', v)}
                    options={allIncomeSourceOptions}
                    onAddNew={v => addDropdownOption('income_source', v, setIncomeSourceCustom)}
                    style={{ fontSize: 13, padding: '4px 8px' }}
                  />
                ) : (
                  <p style={{ fontSize: 14, fontFamily: 'var(--font-heading)', color: '#4D4D4D', margin: 0 }}>{client.income_source ?? '—'}</p>
                )}
              </div>

              {/* Savings — dollar format */}
              <div>
                <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Savings</p>
                {isEditing ? (
                  <input
                    value={editValues.savings}
                    onChange={e => onEditChange('savings', e.target.value)}
                    onBlur={e => onEditChange('savings', formatDollar(e.target.value))}
                    placeholder="e.g. 10000"
                    style={smallInputStyle}
                  />
                ) : (
                  <p style={{ fontSize: 14, fontFamily: 'var(--font-heading)', color: '#4D4D4D', margin: 0 }}>
                    {client.savings ? formatDollar(client.savings) : '—'}
                  </p>
                )}
              </div>

              {/* Investments — plain text */}
              <div>
                <p style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: '#9c9490', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Investments</p>
                {isEditing ? (
                  <input value={editValues.investments} onChange={e => onEditChange('investments', e.target.value)} style={smallInputStyle} />
                ) : (
                  <p style={{ fontSize: 14, fontFamily: 'var(--font-heading)', color: '#4D4D4D', margin: 0 }}>{client.investments ?? '—'}</p>
                )}
              </div>

            </div>
          </div>

          {/* Debt */}
          <div style={innerCard}>
            <CardSubHeading icon="💳">Debt</CardSubHeading>
            {isEditing ? (
              <textarea
                value={editValues.debt_notes}
                onChange={e => onEditChange('debt_notes', e.target.value)}
                placeholder="Student loans, credit card, car loan…"
                style={textareaStyle}
              />
            ) : (
              <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D', lineHeight: 1.6, margin: 0 }}>
                {client.debt_notes ?? <em style={{ color: '#9c9490' }}>No debt notes yet</em>}
              </p>
            )}
          </div>

          {/* Finance Tools */}
          <div style={innerCard}>
            <CardSubHeading icon="🛠">Finance Tools</CardSubHeading>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(() => {
                  const allStaticKnown = Object.values(FINANCE_TOOL_CATEGORIES).flat()
                  const allCustomKnown = Object.values(toolCustomByCat).flat()
                  return Object.entries(FINANCE_TOOL_CATEGORIES).map(([cat, catList]) => {
                    const selectedInCat = editValues.finance_tools.filter(t => {
                      if (catList.includes(t)) return true
                      if (allStaticKnown.includes(t)) return false
                      if ((toolCustomByCat[cat] ?? []).includes(t)) return true
                      if (allCustomKnown.includes(t)) return false
                      return cat === 'Other'
                    })
                    const customInCat = (toolCustomByCat[cat] ?? []).filter(t => !editValues.finance_tools.includes(t))
                    const availableInCat = [
                      ...catList.filter(t => !editValues.finance_tools.includes(t)),
                      ...customInCat,
                    ]
                    return (
                      <div key={cat}>
                        <p style={catLabel}>{cat}</p>
                        {selectedInCat.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                            {selectedInCat.map(t => (
                              <span key={t} style={toolPill}>
                                {t}
                                <button onClick={() => onEditChange('finance_tools', editValues.finance_tools.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
                              </span>
                            ))}
                          </div>
                        )}
                        <ToolDropdown
                          cat={cat}
                          available={availableInCat}
                          onSelect={v => onEditChange('finance_tools', [...editValues.finance_tools, v])}
                          onAddNew={v => addToolOption(cat, v)}
                        />
                      </div>
                    )
                  })
                })()}
              </div>
            ) : tools.length === 0 ? (
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0 }}>No tools recorded yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(() => {
                  const allStaticKnown = Object.values(FINANCE_TOOL_CATEGORIES).flat()
                  const allCustomKnown = Object.values(toolCustomByCat).flat()
                  return Object.entries(FINANCE_TOOL_CATEGORIES).map(([cat, catList]) => {
                    const inCat = tools.filter(t => {
                      if (catList.includes(t)) return true
                      if (allStaticKnown.includes(t)) return false
                      if ((toolCustomByCat[cat] ?? []).includes(t)) return true
                      if (allCustomKnown.includes(t)) return false
                      return cat === 'Other'
                    })
                    if (!inCat.length) return null
                    return (
                      <div key={cat}>
                        <p style={catLabel}>{cat}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {inCat.map(t => <span key={t} style={toolPill}>{t}</span>)}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>

          {/* Goals */}
          <div style={innerCard}>
            <CardSubHeading icon="🎯">Goals</CardSubHeading>
            {goals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {goals.map((g, i) => {
                  const done = g.status === 'complete'
                  if (isEditing) {
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          value={g.title}
                          onChange={e => updateGoal(i, { title: e.target.value })}
                          style={{ ...smallInputStyle, flex: 1 }}
                          placeholder="Goal title"
                        />
                        <button
                          onClick={() => updateGoal(i, { status: done ? 'in_progress' : 'complete' })}
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, backgroundColor: done ? '#640015' : '#F5E8EA', color: done ? '#F7F1ED' : '#640015' }}
                        >
                          {done ? 'Complete' : 'In Progress'}
                        </button>
                        <button onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9490', fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
                      </div>
                    )
                  }
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: done ? 0.6 : 1 }}>
                      <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D', textDecoration: done ? 'line-through' : 'none' }}>{g.title}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', flexShrink: 0, marginLeft: 8, backgroundColor: done ? '#640015' : '#F5E8EA', color: done ? '#F7F1ED' : '#640015' }}>
                        {done ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : !isEditing ? (
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0 }}>No goals recorded yet</p>
            ) : null}
            {isEditing && (
              <button onClick={addGoal} style={{ marginTop: goals.length > 0 ? 10 : 0, fontSize: 11, fontWeight: 600, color: '#640015', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0, textAlign: 'left' }}>
                + Add Goal
              </button>
            )}
          </div>

          {/* Challenges */}
          <div style={{ ...innerCard, backgroundColor: '#F7F1ED' }}>
            <CardSubHeading icon="⚡">Challenges</CardSubHeading>
            {isEditing ? (
              <textarea
                value={editValues.challenges}
                onChange={e => onEditChange('challenges', e.target.value)}
                placeholder="Spending habits, avoidance behaviors, blockers…"
                style={{ ...textareaStyle, backgroundColor: '#F7F1ED' }}
              />
            ) : (
              <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: '#4D4D4D', lineHeight: 1.6, margin: 0 }}>
                {client.challenges ?? <em style={{ color: '#9c9490' }}>No challenges noted yet</em>}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, color: '#1b1c1c', margin: '0 0 16px 0', paddingLeft: 12, borderLeft: '4px solid #640015', lineHeight: 1.4 }}>
          Upcoming
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcomingMeetings.length === 0 && upcomingTasks.length === 0 && (
            <p style={{ fontSize: 14, color: '#9c9490', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: 0 }}>No upcoming meetings or tasks</p>
          )}
          {upcomingMeetings.map(m => {
            const d = safeDate(m.date)
            return (
              <div key={m.id} onClick={() => onSwitchTab('meetings')} style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,179,180,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={20} color="#3d0009" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1b1c1c', fontFamily: 'var(--font-body)', margin: '0 0 2px 0' }}>{m.title}</p>
                    <p style={{ fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0, letterSpacing: '0.05em' }}>
                      {d ? format(d, 'MMM d, yyyy • h:mm aa') : '—'}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#3d0009', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', flexShrink: 0 }}>View →</span>
              </div>
            )
          })}
          {upcomingTasks.map(t => {
            const d = safeDate(t.due_date)
            return (
              <div key={t.id} onClick={() => router.push(`/tasks/${t.id}`)} style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,218,213,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckSquare size={20} color="#8d4c44" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1b1c1c', fontFamily: 'var(--font-body)', margin: '0 0 2px 0' }}>{t.title}</p>
                    <p style={{ fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0, letterSpacing: '0.05em' }}>
                      {d ? `Due ${format(d, 'MMM d, yyyy')}` : 'No due date'}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#3d0009', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', flexShrink: 0 }}>View →</span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
