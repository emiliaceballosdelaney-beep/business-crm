export type MilestoneDetailRow = {
  id: string
  title: string
  description: string | null
  status: string
  target_date: string | null
  completed_at: string | null
  created_at: string
}

export type LinkedProject = {
  id: string
  title: string
  status: string
  due_date: string | null
  description: string | null
  client_id: string | null
  clientName: string | null
  totalTasks: number
  openTasks: number
}

export type LinkedTask = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  description: string | null
  created_at: string | null
  completed_at?: string | null
  client_id: string | null
  client: { name: string } | null
  project: { title: string } | null
}

export type ActivityNote = {
  id: string
  content: string
  created_at: string
}
