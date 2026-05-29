import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import ProjectsPage from '@/components/projects/ProjectsPage'
import type { ProjectCard } from '@/components/projects/ProjectCard'

export const dynamic = 'force-dynamic'

async function getProjectsData() {
  const [
    { data: projects, error: pjErr },
    { data: tasks,    error: tskErr },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, description, status, due_date, client_id, milestone_id, client:clients!client_id(name), milestone:milestones!milestone_id(title)')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at'),
    supabase
      .from('tasks')
      .select('id, project_id, status')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .not('project_id', 'is', null),
  ])

  if (pjErr)  throw new Error(pjErr.message)
  if (tskErr) throw new Error(tskErr.message)

  const tasksByProject: Record<string, { total: number; open: number; completed: number }> = {}
  for (const t of (tasks ?? [])) {
    if (!t.project_id) continue
    if (!tasksByProject[t.project_id]) tasksByProject[t.project_id] = { total: 0, open: 0, completed: 0 }
    tasksByProject[t.project_id].total++
    if (t.status === 'completed') tasksByProject[t.project_id].completed++
    else if (t.status !== 'abandoned') tasksByProject[t.project_id].open++
  }

  const cards: ProjectCard[] = (projects ?? []).map(p => {
    const t = tasksByProject[p.id]
    const totalTasks = t?.total ?? 0
    const openTasks = t?.open ?? 0
    const completedTasks = t?.completed ?? 0
    const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const client = Array.isArray(p.client) ? p.client[0] : p.client
    const milestone = Array.isArray(p.milestone) ? p.milestone[0] : p.milestone
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      due_date: p.due_date,
      client_id: p.client_id ?? null,
      clientName: client?.name ?? null,
      milestoneTitle: milestone?.title ?? null,
      totalTasks,
      openTasks,
      progressPct,
    }
  })

  return cards
}

export default async function Page() {
  const cards = await getProjectsData()
  return <ProjectsPage cards={cards} />
}
