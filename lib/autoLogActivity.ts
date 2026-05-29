'use client'

import { supabase } from './supabase'

// ─── Task Activity ────────────────────────────────────────────────────────────

/**
 * Auto-log a task event to the notes table.
 * Tags: always includes task:<taskId>; also adds project:<projectId>
 * and/or milestone:<milestoneId> when present, so those detail pages'
 * activity feeds pick up the entry automatically.
 *
 * Fire-and-forget — callers should NOT await this.
 *
 * NOTE: Project and milestone status changes are only made through the full
 * edit forms (ProjectForm / MilestoneForm). Those forms are intentionally
 * excluded from auto-logging to avoid scope creep. If direct status toggles
 * are added later, wire them to logProjectActivity / logMilestoneActivity below.
 */
export async function logTaskActivity(params: {
  taskId: string
  taskTitle: string
  content: string
  startupId: string
  projectId?: string | null
  milestoneId?: string | null
}): Promise<void> {
  const { taskId, taskTitle, content, startupId, projectId, milestoneId } = params

  const tags: string[] = [`task:${taskId}`]
  if (projectId)   tags.push(`project:${projectId}`)
  if (milestoneId) tags.push(`milestone:${milestoneId}`)

  await supabase.from('notes').insert({
    startup_id: startupId,
    content: `[${taskTitle}] ${content}`,
    tags,
  })
}

// ─── Project Activity ─────────────────────────────────────────────────────────

/**
 * Auto-log a project event to the notes table.
 * Tags: always includes project:<projectId>; also adds milestone:<milestoneId>
 * when present.
 *
 * Fire-and-forget — callers should NOT await this.
 */
export async function logProjectActivity(params: {
  projectId: string
  content: string
  startupId: string
  milestoneId?: string | null
}): Promise<void> {
  const { projectId, content, startupId, milestoneId } = params

  const tags: string[] = [`project:${projectId}`]
  if (milestoneId) tags.push(`milestone:${milestoneId}`)

  await supabase.from('notes').insert({
    startup_id: startupId,
    content,
    tags,
  })
}

// ─── Milestone Activity ───────────────────────────────────────────────────────

/**
 * Auto-log a milestone event to the notes table.
 * Tags: milestone:<milestoneId>.
 *
 * Fire-and-forget — callers should NOT await this.
 */
export async function logMilestoneActivity(params: {
  milestoneId: string
  content: string
  startupId: string
}): Promise<void> {
  const { milestoneId, content, startupId } = params

  await supabase.from('notes').insert({
    startup_id: startupId,
    content,
    tags: [`milestone:${milestoneId}`],
  })
}
