import { supabase } from '../supabase'
import { PROSPER_STARTUP_ID } from '../constants'
import { WORKFLOWS, WorkflowKey } from './workflows'

export async function enqueueWorkflow(
  clientId: string,
  workflowKey: WorkflowKey,
  startAt: Date = new Date()
) {
  const workflow = WORKFLOWS[workflowKey]
  if (!workflow) return

  // Cancel any previously queued emails for this workflow on this client
  await cancelWorkflowEmails(clientId, workflowKey, 'workflow_restarted')

  const rows = workflow.steps.map(step => ({
    startup_id:   PROSPER_STARTUP_ID,
    client_id:    clientId,
    workflow_key: workflowKey,
    step_key:     step.stepKey,
    template_key: step.templateKey,
    send_at:      new Date(startAt.getTime() + step.delayHours * 60 * 60 * 1000).toISOString(),
    status:       'pending',
  }))

  const { error } = await supabase.from('scheduled_emails').insert(rows)
  if (error) console.error('[scheduler] enqueueWorkflow error:', error)
}

export async function cancelWorkflowEmails(
  clientId: string,
  workflowKey?: WorkflowKey,
  reason = 'cancelled'
) {
  const patch = { status: 'cancelled', cancelled_reason: reason }

  if (workflowKey) {
    const { error } = await supabase
      .from('scheduled_emails')
      .update(patch)
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .eq('workflow_key', workflowKey)
    if (error) console.error('[scheduler] cancelWorkflowEmails error:', error)
  } else {
    const { error } = await supabase
      .from('scheduled_emails')
      .update(patch)
      .eq('client_id', clientId)
      .eq('status', 'pending')
    if (error) console.error('[scheduler] cancelWorkflowEmails error:', error)
  }
}

// Called after a client's lead_stage changes
export async function onStageChange(clientId: string, prevStage: string, nextStage: string) {
  if (prevStage === nextStage) return

  // Moving into discovery → start the intake workflow
  if (nextStage === 'discovery') {
    await enqueueWorkflow(clientId, 'new_lead_intake')
    return
  }

  // Moving out of discovery → cancel intake workflow + post-discovery emails
  if (prevStage === 'discovery') {
    await cancelWorkflowEmails(clientId, 'new_lead_intake', `stage_changed_to_${nextStage}`)
    await cancelWorkflowEmails(clientId, 'post_discovery', `stage_changed_to_${nextStage}`)
  }

  // Going cold or pausing → cancel everything outstanding
  if (['cold', 'paused'].includes(nextStage)) {
    await cancelWorkflowEmails(clientId, undefined, `stage_changed_to_${nextStage}`)
  }
}
