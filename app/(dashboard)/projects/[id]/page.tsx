import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import ProjectDetail from '@/components/projects/ProjectDetail'
import type { ProjectDetailRow, ProjectLinkedTask, ActivityNote } from '@/components/projects/ProjectDetail'

export const dynamic = 'force-dynamic'

async function getProjectDetail(id: string) {
  const [
    { data: project, error: pjErr },
    { data: tasks,   error: taskErr },
    { data: notes,   error: notesErr },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, description, status, due_date, client_id, milestone_id, created_at, client:clients!client_id(name), milestone:milestones!milestone_id(id, title)')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single(),
    supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, description, created_at, completed_at, client_id, client:clients!client_id(name)')
      .eq('project_id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at'),
    supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .contains('tags', [`project:${id}`])
      .order('created_at', { ascending: false }),
  ])

  if (pjErr && pjErr.code !== 'PGRST116') throw new Error(pjErr.message)
  if (!project) notFound()
  if (taskErr)  throw new Error(taskErr.message)
  if (notesErr) throw new Error(notesErr.message)

  const normalize = <T,>(val: T | T[]): T | null =>
    Array.isArray(val) ? (val[0] ?? null) : (val ?? null)

  const client    = normalize(project.client    as any) as { name: string }          | null
  const milestone = normalize(project.milestone as any) as { id: string; title: string } | null

  const projectRow: ProjectDetailRow = {
    id:             project.id,
    title:          project.title,
    description:    project.description,
    status:         project.status,
    due_date:       project.due_date,
    client_id:      project.client_id ?? null,
    milestone_id:   project.milestone_id ?? null,
    clientName:     client?.name     ?? null,
    milestoneTitle: milestone?.title ?? null,
    milestoneId:    milestone?.id    ?? null,
    created_at:     project.created_at,
  }

  const linkedTasks: ProjectLinkedTask[] = (tasks ?? []).map(t => ({
    id:           t.id,
    title:        t.title,
    status:       t.status,
    priority:     t.priority,
    due_date:     t.due_date,
    description:  t.description,
    created_at:   t.created_at,
    completed_at: t.completed_at,
    client_id:    t.client_id ?? null,
    client:       normalize(t.client as any) as { name: string } | null,
  }))

  const activityNotes: ActivityNote[] = (notes ?? []) as ActivityNote[]

  return { project: projectRow, linkedTasks, activityNotes }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getProjectDetail(id)
  return <ProjectDetail {...data} />
}
