export type WorkflowKey = 'new_lead_intake' | 'post_discovery' | 'idle_nudge'

// Context passed to cancelIf at send time — fetched fresh by the cron
export type CancelContext = {
  lead_stage: string | null
  unsubscribed_at: string | null
  hasIntakeResponse: boolean
}

export type WorkflowStep = {
  stepKey: string
  templateKey: string
  delayHours: number
  needsIntakeToken?: boolean
  cancelIf?: (ctx: CancelContext) => boolean
}

export type Workflow = {
  key: WorkflowKey
  steps: WorkflowStep[]
}

export const WORKFLOWS: Record<WorkflowKey, Workflow> = {
  new_lead_intake: {
    key: 'new_lead_intake',
    steps: [
      {
        stepKey: 'discovery_invite',
        templateKey: 'discovery-invite',
        delayHours: 0,
        needsIntakeToken: true,
        cancelIf: ({ lead_stage, unsubscribed_at }) =>
          lead_stage !== 'discovery' || !!unsubscribed_at,
      },
      {
        stepKey: 'intake_followup',
        templateKey: 'intake-followup',
        delayHours: 72,
        needsIntakeToken: true,
        cancelIf: ({ lead_stage, unsubscribed_at, hasIntakeResponse }) =>
          lead_stage !== 'discovery' || hasIntakeResponse || !!unsubscribed_at,
      },
    ],
  },

  post_discovery: {
    key: 'post_discovery',
    steps: [
      {
        stepKey: 'thanks',
        templateKey: 'post-discovery-thanks',
        delayHours: 24,
        cancelIf: ({ lead_stage, unsubscribed_at }) =>
          ['active', 'paused', 'cold'].includes(lead_stage ?? '') || !!unsubscribed_at,
      },
      {
        stepKey: 'checkin',
        templateKey: 'post-discovery-checkin',
        delayHours: 120,
        cancelIf: ({ lead_stage, unsubscribed_at }) =>
          ['active', 'paused', 'cold'].includes(lead_stage ?? '') || !!unsubscribed_at,
      },
    ],
  },

  idle_nudge: {
    key: 'idle_nudge',
    steps: [
      {
        stepKey: 'nudge',
        templateKey: 'idle-nudge',
        delayHours: 0,
        cancelIf: ({ lead_stage, unsubscribed_at }) =>
          ['active', 'cold'].includes(lead_stage ?? '') || !!unsubscribed_at,
      },
    ],
  },
}
