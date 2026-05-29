import React from 'react'
import {
  Html, Head, Body, Container, Section, Text, Link, Hr, Preview,
} from '@react-email/components'

export type EmailProps = {
  firstName: string
  unsubscribeUrl: string
  intakeUrl?: string
  calendlyUrl?: string
}

type LayoutProps = {
  preview: string
  unsubscribeUrl: string
  children: React.ReactNode
}

export function EmailLayout({ preview, unsubscribeUrl, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>Prosper with Em</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you&apos;re connected with Emilia at Prosper with Em.
              <br />
              <Link href={unsubscribeUrl} style={unsubLink}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#F7F1ED',
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: '32px 0',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '560px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

const header: React.CSSProperties = {
  backgroundColor: '#640015',
  padding: '24px 40px',
}

const brandName: React.CSSProperties = {
  color: '#F7F1ED',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '20px',
  fontWeight: '600',
  margin: 0,
  letterSpacing: '0.01em',
}

const content: React.CSSProperties = {
  padding: '40px 40px 32px',
}

const divider: React.CSSProperties = {
  borderColor: '#E8E0DC',
  margin: '0 40px',
}

const footer: React.CSSProperties = {
  padding: '20px 40px 32px',
}

const footerText: React.CSSProperties = {
  color: '#9c9490',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: 0,
}

const unsubLink: React.CSSProperties = {
  color: '#AB655C',
}
