import React from 'react'
import { Text, Button, Section } from '@react-email/components'
import { EmailLayout, EmailProps } from './_layout'

export default function IntakeFollowupEmail({ firstName, intakeUrl, unsubscribeUrl }: EmailProps) {
  return (
    <EmailLayout
      preview={`Hey ${firstName} — just a friendly reminder about your intake form!`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={greeting}>Hey {firstName}! 💛</Text>
      <Text style={body}>
        Just a friendly nudge — your intake form is still waiting for you!
      </Text>
      <Text style={body}>
        It only takes about 5 minutes and it genuinely helps me show up prepared for
        our call. The more I know about you ahead of time, the more useful I can be.
      </Text>

      {intakeUrl && (
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={intakeUrl} style={button}>
            Complete my intake form →
          </Button>
        </Section>
      )}

      <Text style={body}>
        No pressure at all — just wanted to make sure it didn&apos;t get lost in your inbox!
      </Text>
      <Text style={signoff}>Talk soon,<br />Em ✨</Text>
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
