export type TaskDetailRow = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  client_id: string | null
  project_id: string | null
  milestone_id: string | null
  clientName: string | null
  projectTitle: string | null
  projectId: string | null
  milestoneTitle: string | null
  milestoneId: string | null
  created_at: string
}

export type ActivityNote = {
  id: string
  content: string
  created_at: string
}
