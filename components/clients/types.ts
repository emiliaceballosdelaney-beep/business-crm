export type ClientRow = {
  id: string
  name: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  lead_stage: string
  service_type: string | null
  last_contacted: string | null
  updated_at: string
}

export type NextMeeting = {
  client_id: string
  date: string
  meeting_type: string | null
}

// ─── Client Detail ────────────────────────────────────────────
export type GoalEntry = { title: string; status: 'in_progress' | 'complete' }

export type ClientDetailRow = {
  id: string
  name: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  lead_stage: string
  service_type: string | null
  start_date: string | null
  occupation: string | null
  location: string | null
  referred_by: string | null        // UUID FK
  income_range: string | null
  income_source: string | null
  savings: string | null
  investments: string | null
  debt_notes: string | null
  finance_tools: string[] | null
  goals: GoalEntry[] | null
  challenges: string | null
  source: string | null
  end_date: string | null
  notes: string | null
}

export type InteractionRow = {
  id: string
  interaction_type: string
  title: string
  body: string | null
  occurred_at: string
}

export type MeetingDetailRow = {
  id: string
  title: string
  date: string
  duration_minutes: number | null
  meeting_type: string | null
  notes: string | null
  meeting_url: string | null
  google_event_id: string | null
  source_calendar: string | null
}

export type TaskDetailRow = {
  id: string
  title: string
  status: string
  priority: string
  description: string | null
  due_date: string | null
  created_at: string | null
  project: { title: string } | null
  milestone: { title: string } | null
}
