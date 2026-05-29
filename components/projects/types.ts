export type ProjectDetailRow = {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  client_id: string | null
  milestone_id: string | null
  clientName: string | null
  milestoneTitle: string | null
  milestoneId: string | null
  created_at: string
}

export type ProjectLinkedTask = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  description: string | null
  created_at: string | null
  completed_at: string | null
  client_id: string | null
  client: { name: string } | null
}

export type ActivityNote = {
  id: string
  content: string
  created_at: string
}
