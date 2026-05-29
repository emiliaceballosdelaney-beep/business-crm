'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Calendar, ArrowRight } from 'lucide-react'
import { startOfWeek, endOfWeek } from 'date-fns'
import MeetingCard, { type MeetingRow } from './MeetingCard'
import MeetingForm from '@/components/forms/MeetingForm'
import MeetingsCalendar from './MeetingsCalendar'
import MeetingDetail from './MeetingDetail'
import FilterDropdown, { type FilterOption } from '@/components/shared/FilterDropdown'

type ViewMode = 'list' | 'calendar'
type FilterMode = 'all' | 'week' | 'upcoming' | 'past'

const MEETING_FILTER_OPTIONS: FilterOption[] = [
  { value: 'week',     label: 'This Week' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past',     label: 'Past' },
]

interface Props {
  meetings: MeetingRow[]
  googleConnected: boolean
}

export default function MeetingsPage({ meetings, googleConnected }: Props) {
  const router = useRouter()
  const [view, setView]               = useState<ViewMode>('list')
  const [calView, setCalView]         = useState<'month' | 'week'>('month')
  const [filter, setFilter]           = useState<FilterMode>('all')
  const [search, setSearch]           = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [syncing, setSyncing]         = useState(false)
  const [syncMsg, setSyncMsg]         = useState('')
  const [detailMeeting, setDetailMeeting] = useState<MeetingRow | null>(null)
  const [editMeeting, setEditMeeting]     = useState<MeetingRow | null>(null)

  const filtered = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd   = endOfWeek(now,   { weekStartsOn: 1 })
    return meetings.filter(m => {
      const d = new Date(m.date)
      const name = (m.client?.name ?? m.title).toLowerCase()
      if (search && !name.includes(search.toLowerCase())) return false
      if (filter === 'week')     return d >= weekStart && d <= weekEnd
      if (filter === 'upcoming') return d >= now
      if (filter === 'past')     return d < now
      return true
    })
  }, [meetings, filter, search])

  const now = new Date()
  const upcoming = filtered.filter(m => new Date(m.date) >= now)
  const past     = filtered.filter(m => new Date(m.date) <  now).reverse()

  return (
    <div className="p-8 md:p-10 mb-10">
      <MeetingForm isOpen={showAdd} onClose={() => { setShowAdd(false); router.refresh() }} />
      <MeetingForm
        isOpen={!!editMeeting}
        onClose={() => { setEditMeeting(null); router.refresh() }}
        initialData={editMeeting ? {
          id: editMeeting.id,
          title: editMeeting.title,
          client_id: editMeeting.client?.id ?? null,
          date: editMeeting.date,
          meeting_type: editMeeting.meeting_type,
          duration_minutes: editMeeting.duration_minutes,
          notes: editMeeting.notes,
          meeting_url: editMeeting.meeting_url,
          google_event_id: editMeeting.google_event_id,
        } : undefined}
      />
      <MeetingDetail
        meeting={detailMeeting}
        isOpen={!!detailMeeting}
        onClose={() => setDetailMeeting(null)}
        onEdit={m => { setDetailMeeting(null); setEditMeeting(m) }}
      />

      {/* Page header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Meetings</h1>
          <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">Sessions, discovery calls, and business meetings.</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* List / Calendar toggle */}
          <div className="flex bg-[#F7F1ED] p-1 rounded-full border border-[#E8E0DC]">
            {(['list', 'calendar'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1.5 rounded-full text-[11px] font-label font-medium transition-colors"
                style={{
                  backgroundColor: view === v ? '#640015' : 'transparent',
                  color: view === v ? '#F7F1ED' : '#6b7280',
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-[#640015] text-[#fbf9f8] font-body text-[12px] px-4 py-2 rounded-[6px] flex items-center gap-2 hover:opacity-90 transition-opacity border-none cursor-pointer"
          >
            <Plus size={14} />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Sync bar */}
      <GoogleSyncBar
        connected={googleConnected}
        syncing={syncing}
        syncMsg={syncMsg}
        onSync={async () => {
          setSyncing(true); setSyncMsg('')
          try {
            const res = await fetch('/api/calendar/sync', { method: 'POST' })
            const data = await res.json()
            setSyncMsg(data.ok ? `Synced ${data.imported} event${data.imported === 1 ? '' : 's'}` : 'Sync failed')
            if (data.ok) router.refresh()
          } catch { setSyncMsg('Sync failed') }
          finally { setSyncing(false) }
        }}
        onDisconnect={async () => {
          await fetch('/api/auth/google/disconnect', { method: 'POST' })
          router.refresh()
        }}
      />

      {!googleConnected ? (
        <div className="border border-dashed border-[#E8E0DC] rounded-lg py-16 px-4 text-center">
          <p className="font-body text-[15px] text-[#574141] mb-2">Connect Google to sync your meetings here.</p>
          <a href="/api/auth/google/connect" className="font-body text-[14px] text-[#640015] underline">Connect Google Calendar →</a>
        </div>
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex justify-between items-center py-2 mb-2">
            <div className="relative w-[200px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#574141] pointer-events-none" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#debfbf] rounded-lg text-[14px] font-body text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#640015] focus:border-[#640015]"
              />
            </div>
            {view === 'list' ? (
              <FilterDropdown
                value={filter === 'all' ? '' : filter}
                onChange={v => setFilter((v || 'all') as FilterMode)}
                options={MEETING_FILTER_OPTIONS}
                placeholder="All meetings"
              />
            ) : (
              <div className="flex bg-[#F7F1ED] p-1 rounded-full border border-[#E8E0DC]">
                {(['month', 'week'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setCalView(v)}
                    className="px-4 py-1.5 rounded-full text-[11px] font-label font-medium transition-colors"
                    style={{
                      backgroundColor: calView === v ? '#640015' : 'transparent',
                      color: calView === v ? '#F7F1ED' : '#6b7280',
                    }}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {view === 'calendar' ? (
            <MeetingsCalendar meetings={meetings} calView={calView} onSelect={setDetailMeeting} />
          ) : (
            <>
              {filter !== 'past' && (
                <>
                  <SectionHeading label="Upcoming" count={upcoming.length} />
                  <div className="flex flex-col gap-2.5 mb-7">
                    {upcoming.length === 0
                      ? <EmptyState text="No upcoming meetings" />
                      : upcoming.map(m => <MeetingCard key={m.id} meeting={m} onSelect={setDetailMeeting} />)}
                  </div>
                </>
              )}
              {(filter === 'all' || filter === 'past') && (
                <div className={filter === 'past' ? '' : 'mt-10'}>
                  <SectionHeading label="Past" count={past.length} />
                  <div className="flex flex-col gap-2.5">
                    {past.length === 0
                      ? <EmptyState text="No past meetings" />
                      : past.map(m => <MeetingCard key={m.id} meeting={m} past onSelect={setDetailMeeting} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function GoogleSyncBar({ connected, syncing, syncMsg, onSync, onDisconnect }: {
  connected: boolean; syncing: boolean; syncMsg: string
  onSync: () => void; onDisconnect: () => void
}) {
  return (
    <div className="bg-[#F7F1ED] border border-[#E8E0DC] rounded-lg p-2.5 flex justify-between items-center mb-6">
      <div className="flex items-center gap-2 text-gray-500 text-[11px] font-label">
        <Calendar size={14} />
        {connected
          ? `Synced with Google Calendar${syncMsg ? ` · ${syncMsg}` : ''}`
          : 'Google Calendar · Not connected'}
      </div>
      {connected ? (
        <div className="flex gap-3">
          <button
            onClick={onSync}
            disabled={syncing}
            className="text-[#AB655C] text-[11px] font-label hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : <><span>Sync now</span> <ArrowRight size={12} /></>}
          </button>
          <button onClick={onDisconnect} className="text-gray-400 text-[11px] font-label hover:underline">
            Disconnect
          </button>
        </div>
      ) : (
        <a href="/api/auth/google/connect" className="text-[#AB655C] text-[11px] font-label hover:underline flex items-center gap-1">
          Connect <ArrowRight size={12} />
        </a>
      )}
    </div>
  )
}

function SectionHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-4 border-l-2 border-[#640015] pl-2">
      <h2 className="text-[13px] font-headline text-[#4D4D4D] font-semibold uppercase tracking-wider">{label}</h2>
      <span className="bg-[#640015] text-[#F7F1ED] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
        {count}
      </span>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-[#E8E0DC] rounded-lg py-5 px-4 text-center text-[13px] italic text-gray-400 font-label">
      {text}
    </div>
  )
}
