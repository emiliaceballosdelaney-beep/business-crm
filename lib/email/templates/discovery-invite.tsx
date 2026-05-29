import React from 'react'
import { Text, Link, Button, Section } from '@react-email/components'
import { EmailLayout, EmailProps } from './_layout'

export default function DiscoveryInviteEmail({ firstName, intakeUrl, calendlyUrl, unsubscribeUrl }: EmailProps) {
  return (
    <EmailLayout
      preview={`Hi ${firstName}! Before our call, I have one quick thing for you.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={greeting}>Hi {firstName}! 👋</Text>
      <Text style={body}>
        I&apos;m so excited to connect with you. Before we meet, I&apos;d love to learn a little
        more about you — it helps me make our time together as useful as possible.
      </Text>
      <Text style={body}>
        I put together a short intake form. It takes about 5 minutes and makes a huge
        difference in how prepared I can be for our call.
      </Text>

      {intakeUrl && (
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={intakeUrl} style={button}>
            Fill out your intake form →
          </Button>
        </Section>
      )}

      {calendlyUrl && (
        <Text style={body}>
          Haven&apos;t booked your discovery call yet?{' '}
          <Link href={calendlyUrl} style={link}>Grab a time here.</Link>
        </Text>
      )}

      <Text style={body}>
        Looking forward to chatting!
      </Text>
      <Text style={signoff}>Em ✨</Text>
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

const link: React.CSSProperties = {
  color: '#AB655C',
  textDecoration: 'underline',
}
