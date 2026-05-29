import React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout, EmailProps } from './_layout'

export default function PostDiscoveryThanksEmail({ firstName, unsubscribeUrl }: EmailProps) {
  return (
    <EmailLayout
      preview={`It was so great meeting you, ${firstName}!`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={greeting}>It was so great meeting you, {firstName}! 🌸</Text>
      <Text style={body}>
        Thank you for taking the time to connect today. I really loved learning about you
        and what you&apos;re working toward — it was such a genuine conversation.
      </Text>
      <Text style={body}>
        I&apos;m already thinking about how I can support you on this journey. You deserve
        to feel confident and in control of your financial life, and I truly believe
        we could do some meaningful work together.
      </Text>
      <Text style={body}>
        No action needed from you right now — I just wanted to say it was wonderful
        meeting you and I&apos;m rooting for you either way.
      </Text>
      <Text style={signoff}>With warmth,<br />Em 💛</Text>
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
