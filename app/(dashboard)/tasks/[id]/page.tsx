import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import TaskDetail from '@/components/tasks/TaskDetail'
import type { TaskDetailRow, ActivityNote } from '@/components/tasks/TaskDetail'

export const dynamic = 'force-dynamic'

async function getTaskDetail(id: string) {
  const [
    { data: task,  error: taskErr },
    { data: notes, error: notesErr },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, description, status, priority, due_date, client_id, project_id, milestone_id, created_at, client:clients!client_id(name), project:projects!project_id(id, title), milestone:milestones!milestone_id(id, title)')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single(),
    supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .contains('tags', [`task:${id}`])
      .order('created_at', { ascending: false }),
  ])

  if (taskErr && taskErr.code !== 'PGRST116') throw new Error(taskErr.message)
  if (!task) notFound()
  if (notesErr) throw new Error(notesErr.message)

  const normalize = <T,>(val: T | T[]): T | null =>
    Array.isArray(val) ? (val[0] ?? null) : (val ?? null)

  const client    = normalize(task.client    as any) as { name: string }              | null
  const project   = normalize(task.project   as any) as { id: string; title: string } | null
  const milestone = normalize(task.milestone as any) as { id: string; title: string } | null

  const taskRow: TaskDetailRow = {
    id:             task.id,
    title:          task.title,
    description:    task.description,
    status:         task.status,
    priority:       task.priority,
    due_date:       task.due_date,
    client_id:      task.client_id      ?? null,
    project_id:     task.project_id     ?? null,
    milestone_id:   task.milestone_id   ?? null,
    clientName:     client?.name        ?? null,
    projectTitle:   project?.title      ?? null,
    projectId:      project?.id         ?? null,
    milestoneTitle: milestone?.title    ?? null,
    milestoneId:    milestone?.id       ?? null,
    created_at:     task.created_at,
  }

  const activityNotes: ActivityNote[] = (notes ?? []) as ActivityNote[]

  return { task: taskRow, activityNotes }
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getTaskDetail(id)
  return <TaskDetail {...data} />
}
