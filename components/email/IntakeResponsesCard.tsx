'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react'

const QUESTION_LABELS: Record<string, string> = {
  main_goal:          "Main financial goal",
  biggest_challenge:  "Biggest challenge",
  money_relationship: "Relationship with money",
  worked_with_coach:  "Worked with a coach before?",
  success_vision:     "Success vision (6 months)",
  anything_else:      "Anything else",
}

type IntakeRow = {
  id: string
  submitted_at: string
  responses: Record<string, string>
}

export default function IntakeResponsesCard({ clientId }: { clientId: string }) {
  const [data, setData] = useState<IntakeRow | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('intake_responses')
      .select('id, submitted_at, responses')
      .eq('client_id', clientId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setData(data ?? null)
        setLoading(false)
      })
  }, [clientId])

  if (loading || !data) return null

  const entries = Object.entries(data.responses).filter(([, v]) => v?.trim())

  return (
    <div style={card}>
      <button onClick={() => setExpanded(e => !e)} style={headerBtn}>
        <div style={headerLeft}>
          <ClipboardCheck size={14} color="#3f6212" />
          <span style={headingText}>INTAKE FORM COMPLETED</span>
          <span style={completedBadge}>
            {format(new Date(data.submitted_at), 'MMM d, yyyy')}
          </span>
        </div>
        {expanded ? <ChevronUp size={15} color="#9c9490" /> : <ChevronDown size={15} color="#9c9490" />}
      </button>

      {expanded && (
        <div style={answers}>
          {entries.map(([key, value]) => (
            <div key={key} style={answerRow}>
              <p style={questionLabel}>{QUESTION_LABELS[key] ?? key}</p>
              <p style={answerText}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #E8E0DC',
  borderRadius: '12px',
  overflow: 'hidden',
  marginTop: '24px',
}

const headerBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '16px 20px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left' as const,
}

const headerLeft: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

const headingText: React.CSSProperties = {
  fontSize: '11px',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#3f6212',
}

const completedBadge: React.CSSProperties = {
  backgroundColor: '#ecfccb',
  border: '1px solid #a3e635',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#3f6212',
  padding: '1px 8px',
}

const answers: React.CSSProperties = {
  borderTop: '1px solid #E8E0DC',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const answerRow: React.CSSProperties = {}

const questionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#9c9490',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
}

const answerText: React.CSSProperties = {
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1b1c1c',
  lineHeight: '1.6',
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
}
