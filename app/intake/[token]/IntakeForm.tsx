'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const QUESTIONS = [
  {
    id: 'main_goal',
    label: "What's your main financial goal right now?",
    type: 'textarea' as const,
    required: true,
    placeholder: 'e.g. Pay off my student loans, start investing, build an emergency fund…',
  },
  {
    id: 'biggest_challenge',
    label: "What's the biggest challenge standing between you and that goal?",
    type: 'textarea' as const,
    required: true,
    placeholder: 'Be as honest as you like — this stays between us.',
  },
  {
    id: 'money_relationship',
    label: 'How would you describe your relationship with money today?',
    type: 'textarea' as const,
    required: true,
    placeholder: 'e.g. Stressful, confusing, avoidant, okay but could be better…',
  },
  {
    id: 'worked_with_coach',
    label: 'Have you worked with a financial coach or advisor before?',
    type: 'radio' as const,
    required: true,
    options: ['Yes', 'No'],
  },
  {
    id: 'success_vision',
    label: 'What would success look like for you 6 months from now?',
    type: 'textarea' as const,
    required: true,
    placeholder: 'Dream a little — what would feel different?',
  },
  {
    id: 'anything_else',
    label: "Is there anything else you'd like me to know before we meet?",
    type: 'textarea' as const,
    required: false,
    placeholder: 'Totally optional — anything on your mind is welcome here.',
  },
]

interface Props {
  token: string
  clientId: string
  firstName: string
}

export default function IntakeForm({ token, clientId, firstName }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setAnswer(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/intake/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, responses: answers }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }

      router.push('/intake/thanks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={form}>
      {QUESTIONS.map((q, i) => (
        <div key={q.id} style={questionBlock}>
          <label style={questionLabel}>
            <span style={questionNumber}>{i + 1}</span>
            {q.label}
            {!q.required && <span style={optional}> (optional)</span>}
          </label>

          {q.type === 'textarea' && (
            <textarea
              style={textarea}
              placeholder={q.placeholder}
              value={answers[q.id] ?? ''}
              onChange={e => setAnswer(q.id, e.target.value)}
              required={q.required}
              rows={3}
            />
          )}

          {q.type === 'radio' && q.options?.map(opt => (
            <label key={opt} style={radioLabel}>
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => setAnswer(q.id, opt)}
                required={q.required}
                style={{ marginRight: '8px', accentColor: '#640015' }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {error && <p style={errorMsg}>{error}</p>}

      <div style={submitRow}>
        <button type="submit" disabled={submitting} style={submitting ? buttonDisabled : button}>
          {submitting ? 'Submitting…' : 'Submit my answers →'}
        </button>
        <p style={privacyNote}>Your answers are private and only shared with Em.</p>
      </div>
    </form>
  )
}

const form: React.CSSProperties = { padding: '40px' }

const questionBlock: React.CSSProperties = {
  marginBottom: '32px',
}

const questionLabel: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading, Georgia, serif)',
  fontSize: '16px',
  color: '#1b1c1c',
  marginBottom: '10px',
  lineHeight: 1.4,
}

const questionNumber: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#F7F1ED',
  border: '1px solid #debfbf',
  fontSize: '12px',
  fontFamily: 'var(--font-body, Arial, sans-serif)',
  fontWeight: 600,
  color: '#640015',
  marginRight: '10px',
  flexShrink: 0,
  verticalAlign: 'middle',
}

const optional: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'var(--font-body, Arial, sans-serif)',
  color: '#9c9490',
  fontWeight: 400,
}

const textarea: React.CSSProperties = {
  width: '100%',
  borderRadius: '8px',
  border: '1px solid #debfbf',
  padding: '12px 14px',
  fontSize: '15px',
  fontFamily: 'var(--font-body, Arial, sans-serif)',
  color: '#1b1c1c',
  backgroundColor: '#fffaf8',
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
}

const radioLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '15px',
  fontFamily: 'var(--font-body, Arial, sans-serif)',
  color: '#4D4D4D',
  cursor: 'pointer',
}

const submitRow: React.CSSProperties = {
  borderTop: '1px solid #E8E0DC',
  paddingTop: '32px',
  textAlign: 'center' as const,
}

const baseButton: React.CSSProperties = {
  backgroundColor: '#640015',
  color: '#F7F1ED',
  border: 'none',
  borderRadius: '8px',
  padding: '14px 32px',
  fontSize: '15px',
  fontFamily: 'var(--font-body, Arial, sans-serif)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-block',
}

const button: React.CSSProperties = { ...baseButton }
const buttonDisabled: React.CSSProperties = { ...baseButton, opacity: 0.6, cursor: 'not-allowed' }

const privacyNote: React.CSSProperties = {
  fontSize: '12px',
  color: '#9c9490',
  marginTop: '12px',
}

const errorMsg: React.CSSProperties = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '10px 14px',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '16px',
}
