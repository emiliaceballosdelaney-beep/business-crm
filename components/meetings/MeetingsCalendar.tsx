'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import MeetingForm from '@/components/forms/MeetingForm'
import {
  format, isSameDay, isToday, addMonths, subMonths,
  startOfWeek, addDays, addWeeks, subWeeks,
} from 'date-fns'
import type { MeetingRow } from './MeetingCard'
import { getMeetingTypeConfig as getTypeConfig } from '@/lib/constants'

// Monday-first calendar grid for a given month
function getCalendarDays(year: number, month: number): Array<{ date: Date; isCurrentMonth: boolean }> {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const lastDay = new Date(year, month + 1, 0)
  const endOffset = (6 - (lastDay.getDay() + 6) % 7) % 7

  const days: Array<{ date: Date; isCurrentMonth: boolean }> = []
  for (let i = startOffset; i > 0; i--) days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false })
  for (let d = 1; d <= lastDay.getDate(); d++) days.push({ date: new Date(year, month, d), isCurrentMonth: true })
  for (let i = 1; i <= endOffset; i++) days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  return days
}

interface Props {
  meetings: MeetingRow[]
  calView: 'month' | 'week'
  onSelect?: (m: MeetingRow) => void
}

export default function MeetingsCalendar({ meetings, calView, onSelect }: Props) {
  const today = new Date()
  const [monthDate, setMonthDate] = useState(today)
  const [weekDate, setWeekDate]   = useState(today)
  const [selectedDate, setSelectedDate] = useState(today)

  const meetingsByDate = useMemo(() => {
    const map: Record<string, MeetingRow[]> = {}
    for (const m of meetings) {
      const d = new Date(m.date)
      if (isNaN(d.getTime())) continue
      const key = format(d, 'yyyy-MM-dd')
      ;(map[key] ??= []).push(m)
    }
    return map
  }, [meetings])

  const meetingsForDate = (date: Date) => meetingsByDate[format(date, 'yyyy-MM-dd')] ?? []
  const selectedMeetings = meetingsForDate(selectedDate)

  // ── Week view ────────────────────────────────────────────────────────────────
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  if (calView === 'week') {
    return (
      <div className="flex gap-6 border-t border-[#dbd9d9] pt-6">
        <div className="flex-1 min-w-0">
          {/* Week navigation */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => setWeekDate(d => subWeeks(d, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#debfbf] bg-white text-[#640015] hover:bg-[#640015] hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[#4D4D4D] font-headline text-[14px] font-medium">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setWeekDate(d => addWeeks(d, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#debfbf] bg-white text-[#640015] hover:bg-[#640015] hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 7-column week grid */}
          <div className="grid grid-cols-7 border border-[#E8E0DC] rounded-lg overflow-hidden">
            {weekDays.map((day, i) => {
              const dayMeetings = meetingsForDate(day)
              const todayCell   = isToday(day)
              const isSelected  = isSameDay(day, selectedDate)
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={[
                    'border-r border-[#E8E0DC] last:border-r-0 cursor-pointer min-h-[360px]',
                    todayCell ? 'bg-[#F7F1ED]' : isSelected ? 'bg-[#fdf9f7]' : 'bg-white',
                  ].join(' ')}
                >
                  {/* Day header */}
                  <div className="text-center py-2 border-b border-[#E8E0DC]">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-label">
                      {format(day, 'EEE')}
                    </div>
                    {todayCell ? (
                      <div className="w-6 h-6 rounded-full bg-[#640015] text-[#F7F1ED] flex items-center justify-center text-[11px] mx-auto mt-1">
                        {format(day, 'd')}
                      </div>
                    ) : (
                      <div className={`text-[13px] font-medium mt-1 ${isSelected ? 'text-[#640015]' : 'text-[#4D4D4D]'}`}>
                        {format(day, 'd')}
                      </div>
                    )}
                  </div>

                  {/* Meeting pills */}
                  <div className="p-1 flex flex-col gap-1">
                    {dayMeetings.map(m => {
                      const isMeetingPast = new Date(m.date) < new Date()
                      const meetingDate   = new Date(m.date)
                      const tc            = getTypeConfig(m.meeting_type)
                      return (
                        <div
                          key={m.id}
                          onClick={e => { e.stopPropagation(); onSelect?.(m) }}
                          className="p-1 rounded text-[9px] truncate"
                          style={{
                            backgroundColor: isMeetingPast ? 'rgba(245,220,224,0.5)' : tc.badgeBg,
                            color: isMeetingPast ? '#9c9490' : tc.badgeColor,
                            cursor: onSelect ? 'pointer' : 'default',
                          }}
                        >
                          {!isNaN(meetingDate.getTime()) ? format(meetingDate, 'h:mm a') : ''} · {tc.abbrev}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day panel — same as month view */}
        <DayPanel selectedDate={selectedDate} selectedMeetings={selectedMeetings} onSelect={onSelect} />
      </div>
    )
  }

  // ── Month view ───────────────────────────────────────────────────────────────
  const year  = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const days  = getCalendarDays(year, month)

  return (
    <div className="flex gap-6 border-t border-[#dbd9d9] pt-6">
      <div className="flex-1 min-w-0">
        {/* Month navigation */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => setMonthDate(m => subMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#debfbf] bg-white text-[#640015] hover:bg-[#640015] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[#4D4D4D] font-headline text-[14px] font-medium">
            {format(monthDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setMonthDate(m => addMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#debfbf] bg-white text-[#640015] hover:bg-[#640015] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 bg-white border-b border-[#E8E0DC]">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-label uppercase tracking-wider text-gray-500 border-r border-[#E8E0DC]">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map(({ date, isCurrentMonth }, i) => {
            const dayMeetings = meetingsForDate(date)
            const todayCell   = isToday(date)
            const isSelected  = isSameDay(date, selectedDate)
            return (
              <div
                key={i}
                onClick={() => setSelectedDate(date)}
                className={[
                  'min-h-[100px] p-2 border-r border-b border-[#E8E0DC] cursor-pointer',
                  !isCurrentMonth ? 'bg-[#FAFAFA]' : todayCell ? 'bg-[#F7F1ED]' : isSelected ? 'bg-[#fdf9f7]' : 'bg-white',
                ].join(' ')}
              >
                {todayCell ? (
                  <div className="flex justify-start mb-1">
                    <div className="w-5 h-5 rounded-full bg-[#640015] text-[#F7F1ED] flex items-center justify-center text-[10px]">
                      {format(date, 'd')}
                    </div>
                  </div>
                ) : (
                  <div className={`text-[11px] mb-1 ${!isCurrentMonth ? 'text-gray-300' : 'text-[#4D4D4D]'}`}>
                    {format(date, 'd')}
                  </div>
                )}

                {dayMeetings.slice(0, 3).map(m => {
                  const isMeetingPast = new Date(m.date) < new Date()
                  const tc            = getTypeConfig(m.meeting_type)
                  return (
                    <div
                      key={m.id}
                      onClick={e => { e.stopPropagation(); onSelect?.(m) }}
                      className="mt-1 p-1 rounded text-[9px] truncate"
                      style={{
                        backgroundColor: isMeetingPast ? 'rgba(245,220,224,0.5)' : tc.badgeBg,
                        color: isMeetingPast ? '#9c9490' : tc.badgeColor,
                        cursor: onSelect ? 'pointer' : 'default',
                      }}
                    >
                      {`${tc.abbrev} · ${tc.label}`}
                    </div>
                  )
                })}

                {dayMeetings.length > 3 && (
                  <div className="mt-1 text-[9px] text-gray-400 font-label">+{dayMeetings.length - 3} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <DayPanel selectedDate={selectedDate} selectedMeetings={selectedMeetings} onSelect={onSelect} />
    </div>
  )
}

function DayPanel({ selectedDate, selectedMeetings, onSelect }: { selectedDate: Date; selectedMeetings: MeetingRow[]; onSelect?: (m: MeetingRow) => void }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const prefillDate = format(selectedDate, 'yyyy-MM-dd')

  return (
    <div className="w-[280px] flex-shrink-0 bg-white border border-[#E8E0DC] rounded-lg p-4 flex flex-col gap-4 self-start">
      <MeetingForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); router.refresh() }}
        prefillDate={prefillDate}
      />

      <div className="flex justify-between items-start">
        <div>
          <div className="text-[#4D4D4D] font-headline text-sm font-medium">{format(selectedDate, 'MMM d')}</div>
          <div className="text-gray-400 text-[11px] font-label">{format(selectedDate, 'EEEE')}</div>
        </div>
        <div className="text-secondary text-[11px] font-label">
          {selectedMeetings.length === 0
            ? 'No meetings'
            : `${selectedMeetings.length} meeting${selectedMeetings.length > 1 ? 's' : ''}`}
        </div>
      </div>

      {selectedMeetings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-gray-400 text-[12px] font-label text-center">No meetings this day</p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#640015] text-[#640015] text-[11px] font-medium hover:bg-[#640015] hover:text-white transition-colors"
          >
            <Plus size={12} />
            Add Meeting
          </button>
        </div>
      ) : (
        selectedMeetings.map(m => {
          const clientName  = m.client?.name ?? null
          const meetingDate = new Date(m.date)
          const tc          = getTypeConfig(m.meeting_type)
          return (
            <div
              key={m.id}
              onClick={() => onSelect?.(m)}
              className="border border-[#E8E0DC] rounded-lg p-3 flex flex-col gap-3"
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ backgroundColor: tc.avatarBg, color: tc.avatarColor }}>
                  {tc.abbrev}
                </div>
                <div>
                  <div className="text-[#4D4D4D] text-[13px] font-bold">{m.title}</div>
                  {clientName && <div className="text-[11px] text-[#9c9490]">{clientName}</div>}
                  <span className="px-1.5 py-0.5 rounded text-[9px] inline-block font-semibold" style={{ backgroundColor: tc.badgeBg, color: tc.badgeColor }}>
                    {tc.label}
                  </span>
                </div>
              </div>
              <div className="text-gray-500 text-[11px] font-label flex items-center gap-1">
                <Clock size={12} />
                {!isNaN(meetingDate.getTime()) ? format(meetingDate, 'h:mm a') : '—'}
                {m.duration_minutes ? ` · ${m.duration_minutes} min` : ''}
              </div>
              {m.source_calendar && (
                <div className="text-[10px] text-gray-400 font-label">📅 {m.source_calendar}</div>
              )}
              {m.meeting_url && (
                <button
                  onClick={e => { e.stopPropagation(); window.open(m.meeting_url!, '_blank') }}
                  className="w-full border border-[#640015] text-[#640015] py-1 rounded text-[11px] font-medium hover:bg-[#640015] hover:text-white transition-colors"
                >
                  Join
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
