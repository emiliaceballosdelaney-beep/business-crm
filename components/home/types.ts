export type MeetingRow = {
  id: string
  title: string
  date: string
  duration_minutes: number | null
  meeting_type: string | null
  notes: string | null
  status: string
  meeting_url: string | null
  google_event_id: string | null
  source_calendar: string | null
  client: { id: string; name: string; lead_stage: string | null } | null
}

export type TaskRow = {
  id: string
  title: string
  status: string
  priority: string | null
  description: string | null
  due_date: string | null
  created_at: string | null
  project: { title: string } | null
  client: { name: string } | null
  milestone: { title: string } | null
}
