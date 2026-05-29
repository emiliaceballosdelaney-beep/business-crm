import React from 'react'
import { Text, Button, Section } from '@react-email/components'
import { EmailLayout, EmailProps } from './_layout'

export default function IdleNudgeEmail({ firstName, calendlyUrl, unsubscribeUrl }: EmailProps) {
  return (
    <EmailLayout
      preview={`Hey ${firstName} — just checking in on you 💛`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={greeting}>Hey {firstName} 💛</Text>
      <Text style={body}>
        It&apos;s been a little while since we connected, and I just wanted to check in.
      </Text>
      <Text style={body}>
        If you&apos;re still thinking about working on your finances — whether that&apos;s
        paying off debt, starting to invest, or just feeling less stressed about money —
        I&apos;m here and would genuinely love to help.
      </Text>
      <Text style={body}>
        No pressure at all. I just didn&apos;t want you to feel like you were forgotten. 🌸
      </Text>

      {calendlyUrl && (
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={calendlyUrl} style={button}>
            Book a free call →
          </Button>
        </Section>
      )}

      <Text style={signoff}>With warmth,<br />Em ✨</Text>
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
