export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import HomeStatCards from '@/components/home/HomeStatCards'
import HomeMeetingsSection from '@/components/home/HomeMeetingsSection'
import HomeTasksSection from '@/components/home/HomeTasksSection'
import type { MeetingRow, TaskRow } from '@/components/home/types'

const PST = 'America/Los_Angeles'

// Returns the UTC offset string for PST/PDT at a given moment (e.g., "-07:00")
function getPSTOffset(date: Date): string {
  const tzPart = new Intl.DateTimeFormat('en-US', { timeZone: PST, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')?.value ?? 'GMT-7'
  const m = tzPart.match(/GMT([+-])(\d+)/)
  return m ? `${m[1]}${m[2].padStart(2, '0')}:00` : '-07:00'
}

async function getHomeData() {
  const now = new Date()
  const offsetStr = getPSTOffset(now)

  // Today's date in PST (e.g., "2026-05-26")
  const todayISO = now.toLocaleDateString('en-CA', { timeZone: PST })

  // Start/end of today as UTC timestamps, anchored to PST midnight
  const todayStart = new Date(`${todayISO}T00:00:00${offsetStr}`)
  const todayEnd   = new Date(`${todayISO}T23:59:59${offsetStr}`)

  // Monday-based week start in PST
  const todayNoon = new Date(`${todayISO}T12:00:00${offsetStr}`)
  const pstDayOfWeek = todayNoon.getDay()
  const daysFromMonday = (pstDayOfWeek + 6) % 7
  const weekStart = new Date(todayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000)

  // Month boundaries in PST
  const [pstYear, pstMonth] = todayISO.split('-').map(Number)
  const monthStart = new Date(`${pstYear}-${String(pstMonth).padStart(2, '0')}-01T00:00:00${offsetStr}`)
  const prevMonth = pstMonth === 1 ? 12 : pstMonth - 1
  const prevYear  = pstMonth === 1 ? pstYear - 1 : pstYear
  const lastMonthStart = new Date(`${prevYear}-${String(prevMonth).padStart(2, '0')}-01T00:00:00${offsetStr}`)
  const lastMonthEnd = monthStart

  const [
    { data: clients },
    { data: allTasks },
    { data: projects },
    { data: milestones },
    { data: todayMeetings },
    { data: tasksDueToday },
  ] = await Promise.all([
    supabase.from('clients').select('id, lead_stage, created_at').eq('startup_id', PROSPER_STARTUP_ID),
    supabase.from('tasks').select('id, status').eq('startup_id', PROSPER_STARTUP_ID),
    supabase.from('projects').select('id, status').eq('startup_id', PROSPER_STARTUP_ID),
    supabase.from('milestones').select('id, status').eq('startup_id', PROSPER_STARTUP_ID),
    supabase
      .from('meetings')
      .select('id, title, date, duration_minutes, meeting_type, notes, status, meeting_url, google_event_id, source_calendar, client:clients!client_id(id, name, lead_stage)')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .gte('date', todayStart.toISOString())
      .lte('date', todayEnd.toISOString())
      .not('status', 'eq', 'cancelled')
      .order('date'),
    supabase
      .from('tasks')
      .select('id, title, status, priority, description, due_date, created_at, project:projects!project_id(title), client:clients!client_id(name), milestone:milestones!milestone_id(title)')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .eq('due_date', todayISO)
      .neq('status', 'abandoned')
      .order('status'),
  ])

  // Stage counts
  const stageCounts: Record<string, number> = {}
  for (const c of (clients ?? [])) {
    const s = c.lead_stage ?? 'lead'
    stageCounts[s] = (stageCounts[s] ?? 0) + 1
  }

  // New leads (lead stage only, by created_at)
  const leads = (clients ?? []).filter(c => c.lead_stage === 'lead')
  const newLeadsThisWeek  = leads.filter(c => new Date(c.created_at) >= weekStart).length
  const newLeadsThisMonth = leads.filter(c => new Date(c.created_at) >= monthStart).length
  const newLeadsLastMonth = leads.filter(c => new Date(c.created_at) >= lastMonthStart && new Date(c.created_at) < lastMonthEnd).length

  // Task stats
  const tasksCompleted = (allTasks ?? []).filter(t => t.status === 'completed').length
  const tasksOpen      = (allTasks ?? []).filter(t => t.status === 'pending' || t.status === 'on_hold').length

  // Project stats
  const projectStats = { active: 0, on_hold: 0, complete: 0 }
  for (const p of (projects ?? [])) {
    if (p.status === 'active')        projectStats.active++
    else if (p.status === 'on_hold')  projectStats.on_hold++
    else if (p.status === 'complete') projectStats.complete++
  }

  // Milestone stats
  const msTotal      = (milestones ?? []).length
  const msComplete   = (milestones ?? []).filter(m => m.status === 'achieved').length
  const msInProgress = (milestones ?? []).filter(m => m.status === 'in_progress').length

  const pstHour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: PST, hour: 'numeric', hour12: false }).format(now), 10
  )
  const displayDate = new Intl.DateTimeFormat('en-US', {
    timeZone: PST, weekday: 'long', month: 'long', day: 'numeric',
  }).format(now)

  return {
    pstHour,
    displayDate,
    stageCounts,
    newLeads: leads.length,
    newLeadsThisWeek,
    newLeadsThisMonth,
    newLeadsLastMonth,
    tasksCompleted,
    tasksOpen,
    projectStats,
    milestonesComplete: msComplete,
    milestonesInProgress: msInProgress,
    milestonesTotal: msTotal,
    todayMeetings: (todayMeetings ?? []).map(m => ({
      ...m,
      client: Array.isArray(m.client) ? (m.client[0] ?? null) : (m.client ?? null),
    })) as unknown as MeetingRow[],
    tasksDueToday: (tasksDueToday ?? []).map(t => ({
      ...t,
      project:   Array.isArray(t.project)   ? (t.project[0]   ?? null) : (t.project   ?? null),
      client:    Array.isArray(t.client)    ? (t.client[0]    ?? null) : (t.client    ?? null),
      milestone: Array.isArray(t.milestone) ? (t.milestone[0] ?? null) : (t.milestone ?? null),
    })) as unknown as TaskRow[],
  }
}

export default async function HomePage() {
  const data = await getHomeData()
  const greeting = data.pstHour < 12 ? 'Good morning' : data.pstHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: 40 }}>
      {/* Greeting + Stats */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: '#4D4D4D', marginBottom: 8, lineHeight: 1.2 }}>
          {greeting}, Emilia
        </h1>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: 'rgba(27,28,28,0.6)', margin: 0, lineHeight: 1.6 }}>
          {data.displayDate}
        </p>

        {/* 5 Stat Cards */}
        <HomeStatCards
          stageCounts={data.stageCounts}
          newLeads={data.newLeads}
          newLeadsThisWeek={data.newLeadsThisWeek}
          newLeadsThisMonth={data.newLeadsThisMonth}
          newLeadsLastMonth={data.newLeadsLastMonth}
          tasksCompleted={data.tasksCompleted}
          tasksOpen={data.tasksOpen}
          projectStats={data.projectStats}
          milestonesComplete={data.milestonesComplete}
          milestonesInProgress={data.milestonesInProgress}
          milestonesTotal={data.milestonesTotal}
        />
      </div>

      {/* Today's Meetings + Tasks Due Today */}
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <HomeMeetingsSection meetings={data.todayMeetings} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <HomeTasksSection tasks={data.tasksDueToday} />
        </div>
      </div>
    </div>
  )
}
