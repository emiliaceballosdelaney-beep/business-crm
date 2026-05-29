import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { sendEmail } from '@/lib/email/send'
import { getOrCreateIntakeToken } from '@/lib/email/intake-tokens'
import { enqueueWorkflow } from '@/lib/email/scheduler'
import { WORKFLOWS } from '@/lib/email/workflows'

// Auth: Vercel Cron sets Authorization: Bearer <CRON_SECRET>
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { sent: 0, skipped: 0, failed: 0 }

  // ── 1. Process due scheduled emails ──────────────────────────
  const now = new Date().toISOString()
  const { data: dueRows } = await supabase
    .from('scheduled_emails')
    .select('*')
    .eq('status', 'pending')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .lte('send_at', now)
    .order('send_at', { ascending: true })
    .limit(50)

  for (const row of dueRows ?? []) {
    // Fetch fresh client state for cancel evaluation
    const { data: client } = await supabase
      .from('clients')
      .select('id, first_name, email, lead_stage, unsubscribed_at')
      .eq('id', row.client_id)
      .single()

    if (!client) {
      await markRow(row.id, 'cancelled', 'client_not_found')
      results.skipped++
      continue
    }

    // Check if intake response exists (needed by some cancel conditions)
    const { count: intakeCount } = await supabase
      .from('intake_responses')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', row.client_id)

    const cancelCtx = {
      lead_stage:          client.lead_stage,
      unsubscribed_at:     client.unsubscribed_at,
      hasIntakeResponse:   (intakeCount ?? 0) > 0,
    }

    // Find the step definition to check cancelIf
    const workflow = WORKFLOWS[row.workflow_key as keyof typeof WORKFLOWS]
    const step = workflow?.steps.find(s => s.stepKey === row.step_key)

    if (step?.cancelIf?.(cancelCtx)) {
      await markRow(row.id, 'cancelled', 'cancel_condition_met')
      results.skipped++
      continue
    }

    // Build template data
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startup-dashboard-five.vercel.app'
    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL

    let intakeUrl: string | undefined
    if (step?.needsIntakeToken) {
      try {
        const token = await getOrCreateIntakeToken(row.client_id)
        intakeUrl = `${appUrl}/intake/${token}`
      } catch {
        // Non-fatal: send email without intake link
      }
    }

    const result = await sendEmail({
      client,
      templateKey: row.template_key,
      data: { intakeUrl, ...(calendlyUrl ? { calendlyUrl } : {}) },
    })

    if (result.ok) {
      await supabase.from('scheduled_emails').update({
        status:    'sent',
        sent_at:   new Date().toISOString(),
        resend_id: result.resendId,
      }).eq('id', row.id)
      results.sent++
    } else {
      await markRow(row.id, 'failed', result.error)
      results.failed++
    }
  }

  // ── 2. Idle nudge detection ───────────────────────────────────
  const idleThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const nudgeCooloff  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: idleClients } = await supabase
    .from('clients')
    .select('id')
    .eq('startup_id', PROSPER_STARTUP_ID)
    .in('lead_stage', ['lead', 'discovery'])
    .is('unsubscribed_at', null)
    .or(`last_contacted_at.is.null,last_contacted_at.lt.${idleThreshold}`)

  for (const { id: clientId } of idleClients ?? []) {
    // Skip if already nudged in the last 30 days
    const { count } = await supabase
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('template_key', 'idle-nudge')
      .gte('sent_at', nudgeCooloff)

    if ((count ?? 0) > 0) continue

    await enqueueWorkflow(clientId, 'idle_nudge')
  }

  return NextResponse.json(results)
}

async function markRow(id: string, status: string, reason: string) {
  await supabase
    .from('scheduled_emails')
    .update({ status, cancelled_reason: reason })
    .eq('id', id)
}
