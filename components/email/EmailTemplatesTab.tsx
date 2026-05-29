'use client'

import { useState } from 'react'

type Template = {
  key: string
  label: string
  trigger: string
  preview: string
}

const TEMPLATES: Template[] = [
  {
    key: 'discovery-invite',
    label: 'Discovery Invite',
    trigger: 'When a client moves to Discovery stage',
    preview: `Hi [First Name]! I'm so excited to connect with you. Before we meet, I'd love to learn a little more about you — it helps me make our time together as useful as possible. I put together a short intake form. It takes about 5 minutes and makes a huge difference in how prepared I can be for our call. [Intake form button] Haven't booked your discovery call yet? Grab a time here. Looking forward to chatting! Em ✨`,
  },
  {
    key: 'intake-followup',
    label: 'Intake Follow-up',
    trigger: 'new_lead_intake — step 2 (72h after Discovery Invite, if intake not submitted)',
    preview: `Hey [First Name]! Just a friendly nudge — your intake form is still waiting for you! It only takes about 5 minutes and it genuinely helps me show up prepared for our call. The more I know about you ahead of time, the more useful I can be. [Complete intake form button] No pressure at all — just wanted to make sure it didn't get lost in your inbox! Talk soon, Em ✨`,
  },
  {
    key: 'post-discovery-thanks',
    label: 'Post-Discovery Thanks',
    trigger: 'post_discovery — step 1 (24h after discovery call is logged)',
    preview: `It was so great meeting you, [First Name]! Thank you for taking the time to connect today. I really loved learning about you and what you're working toward — it was such a genuine conversation. I'm already thinking about how I can support you on this journey. You deserve to feel confident and in control of your financial life, and I truly believe we could do some meaningful work together. No action needed from you right now — I just wanted to say it was wonderful meeting you and I'm rooting for you either way. With warmth, Em 💛`,
  },
  {
    key: 'post-discovery-checkin',
    label: 'Post-Discovery Check-in',
    trigger: 'post_discovery — step 2 (5 days after discovery call)',
    preview: `Hey [First Name] 👋 I know life gets busy, so I just wanted to check in and see if you have any questions about working together. If something held you back or you'd like to talk through what coaching would look like for your situation, I'm genuinely happy to chat — no obligation at all. And if the timing just isn't right, that's completely okay too. I'll be here when you're ready. [Let's reconnect button] Wishing you the best, Em ✨`,
  },
  {
    key: 'idle-nudge',
    label: 'Idle Nudge',
    trigger: 'idle_nudge — auto-detected (14+ days no contact in lead/discovery)',
    preview: `Hey [First Name] 💛 It's been a little while since we connected, and I just wanted to check in. If you're still thinking about working on your finances — whether that's paying off debt, starting to invest, or just feeling less stressed about money — I'm here and would genuinely love to help. No pressure at all. I just didn't want you to feel like you were forgotten. 🌸 [Book a free call button] With warmth, Em ✨`,
  },
]

export default function EmailTemplatesTab() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}
    >
      {TEMPLATES.map(tpl => {
        const isOpen = openKey === tpl.key

        return (
          <div
            key={tpl.key}
            style={{
              backgroundColor: 'white',
              border: '1px solid #debfbf',
              borderRadius: 12,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 15,
                color: '#3d0009',
              }}
            >
              {tpl.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: '#9c9490',
                lineHeight: 1.5,
              }}
            >
              {tpl.trigger}
            </span>

            <button
              onClick={() => setOpenKey(isOpen ? null : tpl.key)}
              style={{
                marginTop: 4,
                alignSelf: 'flex-start',
                border: '1px solid #640015',
                borderRadius: 6,
                backgroundColor: 'transparent',
                color: '#640015',
                padding: '5px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {isOpen ? 'Hide preview' : 'Preview'}
            </button>

            {isOpen && (
              <div
                style={{
                  marginTop: 8,
                  backgroundColor: '#F7F1ED',
                  border: '1px solid #E8E0DC',
                  borderRadius: 8,
                  padding: '14px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: '#4D4D4D',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {tpl.preview}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
