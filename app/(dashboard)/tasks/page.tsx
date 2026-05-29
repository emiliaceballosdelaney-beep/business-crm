import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import TasksPage, { type TaskItem } from '@/components/tasks/TasksPage'

export const dynamic = 'force-dynamic'

async function getTasksData() {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, description, due_date, created_at, completed_at, client_id, project:projects!project_id(title), client:clients!client_id(name), milestone:milestones!milestone_id(title)')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .neq('status', 'abandoned')
    .order('status')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw new Error(error.message)

  // Supabase join typing returns relations as arrays; normalize to single objects at fetch boundary
  const tasks = (data ?? []).map(t => ({
    ...t,
    project:   Array.isArray(t.project)   ? (t.project[0]   ?? null) : (t.project   ?? null),
    client:    Array.isArray(t.client)    ? (t.client[0]    ?? null) : (t.client    ?? null),
    milestone: Array.isArray(t.milestone) ? (t.milestone[0] ?? null) : (t.milestone ?? null),
  })) as unknown as TaskItem[]

  const projectNames = Array.from(
    new Set(tasks.flatMap(t => t.project ? [t.project.title] : []))
  ).sort()

  return { tasks, projectNames }
}

export default async function Page() {
  const { tasks, projectNames } = await getTasksData()
  return <TasksPage tasks={tasks} projectNames={projectNames} />
}
