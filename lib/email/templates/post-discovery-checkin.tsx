import React from 'react'
import { Text, Button, Section } from '@react-email/components'
import { EmailLayout, EmailProps } from './_layout'

export default function PostDiscoveryCheckinEmail({ firstName, calendlyUrl, unsubscribeUrl }: EmailProps) {
  return (
    <EmailLayout
      preview={`Hey ${firstName} — still thinking it over? I'm here when you're ready.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={greeting}>Hey {firstName} 👋</Text>
      <Text style={body}>
        I know life gets busy, so I just wanted to check in and see if you have any
        questions about working together.
      </Text>
      <Text style={body}>
        If something held you back or you&apos;d like to talk through what coaching
        would look like for your situation, I&apos;m genuinely happy to chat — no
        obligation at all.
      </Text>
      <Text style={body}>
        And if the timing just isn&apos;t right, that&apos;s completely okay too. I&apos;ll
        be here when you&apos;re ready.
      </Text>

      {calendlyUrl && (
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={calendlyUrl} style={button}>
            Let&apos;s reconnect →
          </Button>
        </Section>
      )}

      <Text style={signoff}>Wishing you the best,<br />Em ✨</Text>
    </EmailLayout>
  )
}

const greeting: React.CSSProperties = {
  fontSize: '18px',
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: '#640015',
  margin: '0 0 16px',
}

const body: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#4D4D4D',
  margin: '0 0 16px',
}

const signoff: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#4D4D4D',
  margin: '24px 0 0',
}

const button: React.CSSProperties = {
  backgroundColor: '#640015',
  borderRadius: '8px',
  color: '#F7F1ED',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
