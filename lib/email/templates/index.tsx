import React from 'react'
import { render } from '@react-email/render'
import type { EmailProps } from './_layout'
import DiscoveryInviteEmail from './discovery-invite'
import IntakeFollowupEmail from './intake-followup'
import PostDiscoveryThanksEmail from './post-discovery-thanks'
import PostDiscoveryCheckinEmail from './post-discovery-checkin'
import IdleNudgeEmail from './idle-nudge'

type TemplateConfig = {
  subject: string | ((data: EmailProps) => string)
  component: React.ComponentType<EmailProps>
}

const TEMPLATES: Record<string, TemplateConfig> = {
  'discovery-invite': {
    subject: 'Before our call — a quick form for you',
    component: DiscoveryInviteEmail,
  },
  'intake-followup': {
    subject: 'Friendly reminder: your intake form is waiting',
    component: IntakeFollowupEmail,
  },
  'post-discovery-thanks': {
    subject: (d) => `It was so great meeting you, ${d.firstName}!`,
    component: PostDiscoveryThanksEmail,
  },
  'post-discovery-checkin': {
    subject: "Still thinking it over? I'm here when you're ready.",
    component: PostDiscoveryCheckinEmail,
  },
  'idle-nudge': {
    subject: 'Checking in on you 💛',
    component: IdleNudgeEmail,
  },
}

export type RenderResult = { subject: string; html: string }

export async function renderTemplate(templateKey: string, data: EmailProps): Promise<RenderResult> {
  const config = TEMPLATES[templateKey]
  if (!config) throw new Error(`Unknown email template: ${templateKey}`)

  const subject = typeof config.subject === 'function' ? config.subject(data) : config.subject
  const element = React.createElement(config.component, data)
  const html = await render(element)

  return { subject, html }
}
