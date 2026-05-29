import { supabase } from '../supabase'
import { PROSPER_STARTUP_ID } from '../constants'
import { getResend, FROM_EMAIL, REPLY_TO } from './resend'
import { renderTemplate } from './templates/index'
import type { EmailProps } from './templates/_layout'

type ClientForSend = {
  id: string
  first_name: string
  email: string | null
  unsubscribed_at?: string | null
}

type SendEmailOptions = {
  client: ClientForSend
  templateKey: string
  data?: Partial<Omit<EmailProps, 'firstName' | 'unsubscribeUrl'>>
}

type SendResult = { ok: true; resendId: string } | { ok: false; error: string }

export async function sendEmail({ client, templateKey, data = {} }: SendEmailOptions): Promise<SendResult> {
  if (!client.email) return { ok: false, error: 'no_email' }
  if (client.unsubscribed_at) return { ok: false, error: 'unsubscribed' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startup-dashboard-five.vercel.app'
  const unsubscribeUrl = `${appUrl}/api/email/unsubscribe?id=${client.id}`

  const templateData: EmailProps = {
    firstName: client.first_name,
    unsubscribeUrl,
    ...data,
  }

  let subject: string
  let html: string

  try {
    const rendered = await renderTemplate(templateKey, templateData)
    subject = rendered.subject
    html = rendered.html
  } catch (err) {
    console.error('[send] renderTemplate error:', err)
    return { ok: false, error: 'render_failed' }
  }

  const { data: result, error: sendError } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: client.email,
    replyTo: REPLY_TO,
    subject,
    html,
  })

  if (sendError || !result) {
    console.error('[send] Resend error:', sendError)
    return { ok: false, error: sendError?.message ?? 'send_failed' }
  }

  // Log to email_log and interactions in parallel
  await Promise.allSettled([
    supabase.from('email_log').insert({
      startup_id:   PROSPER_STARTUP_ID,
      client_id:    client.id,
      template_key: templateKey,
      subject,
      to_email:     client.email,
      resend_id:    result.id,
      status:       'sent',
    }),
    supabase.from('interactions').insert({
      startup_id:       PROSPER_STARTUP_ID,
      client_id:        client.id,
      interaction_type: 'email',
      title:            subject,
      body:             `Automated email: ${templateKey}`,
      occurred_at:      new Date().toISOString(),
    }),
  ])

  return { ok: true, resendId: result.id }
}
