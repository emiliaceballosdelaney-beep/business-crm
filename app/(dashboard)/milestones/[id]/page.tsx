import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import MilestoneDetail from '@/components/milestones/MilestoneDetail'
import type { MilestoneDetailRow, LinkedProject, LinkedTask, ActivityNote } from '@/components/milestones/MilestoneDetail'

export const dynamic = 'force-dynamic'

async function getMilestoneDetail(id: string) {
  const [
    { data: milestone, error: msErr },
    { data: projects,  error: pjErr },
    { data: tasks,     error: taskErr },
    { data: notes,     error: notesErr },
  ] = await Promise.all([
    supabase
      .from('milestones')
      .select('id, title, description, status, target_date, completed_at, created_at')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single(),
    supabase
      .from('projects')
      .select('id, title, status, due_date, description, client_id, client:clients!client_id(name)')
      .eq('milestone_id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at'),
    supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, description, created_at, completed_at, client_id, client:clients!client_id(name), project:projects!project_id(title)')
      .eq('milestone_id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at'),
    supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .contains('tags', [`milestone:${id}`])
      .order('created_at', { ascending: false }),
  ])

  if (msErr && msErr.code !== 'PGRST116') throw new Error(msErr.message)
  if (!milestone) notFound()
  if (pjErr)     throw new Error(pjErr.message)
  if (taskErr)   throw new Error(taskErr.message)
  if (notesErr)  throw new Error(notesErr.message)

  // Fetch task counts per linked project (skip if no projects)
  const projectIds = (projects ?? []).map(p => p.id)
  const projectTaskCounts: Record<string, { total: number; open: number }> = {}
  if (projectIds.length > 0) {
    const { data: pTasks } = await supabase
      .from('tasks')
      .select('project_id, status')
      .in('project_id', projectIds)
      .eq('startup_id', PROSPER_STARTUP_ID)
    for (const t of (pTasks ?? [])) {
      if (!t.project_id) continue
      if (!projectTaskCounts[t.project_id]) projectTaskCounts[t.project_id] = { total: 0, open: 0 }
      projectTaskCounts[t.project_id].total++
      if (t.status !== 'completed' && t.status !== 'abandoned') projectTaskCounts[t.project_id].open++
    }
  }

  const normalize = <T,>(val: T | T[]): T | null =>
    Array.isArray(val) ? (val[0] ?? null) : (val ?? null)

  const linkedProjects: LinkedProject[] = (projects ?? []).map(p => ({
    id: p.id,
    title: p.title,
    status: p.status,
    due_date: p.due_date,
    description: p.description,
    client_id: p.client_id,
    clientName: (normalize(p.client as any) as { name: string } | null)?.name ?? null,
    totalTasks: projectTaskCounts[p.id]?.total ?? 0,
    openTasks:  projectTaskCounts[p.id]?.open  ?? 0,
  }))

  const linkedTasks: LinkedTask[] = (tasks ?? []).map(t => ({
    id:           t.id,
    title:        t.title,
    status:       t.status,
    priority:     t.priority,
    due_date:     t.due_date,
    description:  t.description,
    created_at:   t.created_at,
    completed_at: t.completed_at,
    client_id:    t.client_id,
    client:  normalize(t.client  as any) as { name: string }  | null,
    project: normalize(t.project as any) as { title: string } | null,
  }))

  const activityNotes: ActivityNote[] = (notes ?? []) as ActivityNote[]

  return {
    milestone: milestone as MilestoneDetailRow,
    linkedProjects,
    linkedTasks,
    activityNotes,
  }
}

export default async function MilestoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getMilestoneDetail(id)
  return <MilestoneDetail {...data} />
}
