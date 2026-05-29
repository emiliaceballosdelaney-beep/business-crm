import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import MilestonesPage from '@/components/milestones/MilestonesPage'
import type { MilestoneCard } from '@/components/milestones/MilestoneCard'

export const dynamic = 'force-dynamic'

async function getMilestonesData() {
  const [
    { data: milestones, error: msErr },
    { data: projects,   error: pjErr },
    { data: tasks,      error: tskErr },
  ] = await Promise.all([
    supabase
      .from('milestones')
      .select('id, title, description, status, target_date, completed_at')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at'),
    supabase
      .from('projects')
      .select('id, milestone_id')
      .eq('startup_id', PROSPER_STARTUP_ID),
    supabase
      .from('tasks')
      .select('id, milestone_id, status')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .not('milestone_id', 'is', null),
  ])

  if (msErr)  throw new Error(msErr.message)
  if (pjErr)  throw new Error(pjErr.message)
  if (tskErr) throw new Error(tskErr.message)

  const projectsByMs: Record<string, number> = {}
  for (const p of (projects ?? [])) {
    if (p.milestone_id) projectsByMs[p.milestone_id] = (projectsByMs[p.milestone_id] ?? 0) + 1
  }

  const tasksByMs: Record<string, { total: number; completed: number }> = {}
  for (const t of (tasks ?? [])) {
    if (!t.milestone_id) continue
    if (!tasksByMs[t.milestone_id]) tasksByMs[t.milestone_id] = { total: 0, completed: 0 }
    tasksByMs[t.milestone_id].total++
    if (t.status === 'completed') tasksByMs[t.milestone_id].completed++
  }

  const cards: MilestoneCard[] = (milestones ?? []).map(m => {
    const t = tasksByMs[m.id]
    const progressPct = t && t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      target_date: m.target_date,
      completed_at: m.completed_at,
      projectCount: projectsByMs[m.id] ?? 0,
      taskCount: t?.total ?? 0,
      progressPct,
    }
  })

  return cards
}

export default async function Page() {
  const cards = await getMilestonesData()
  return <MilestonesPage cards={cards} />
}
