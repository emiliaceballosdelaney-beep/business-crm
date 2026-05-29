import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { validateIntakeToken } from '@/lib/email/intake-tokens'
import IntakeForm from './IntakeForm'

interface Props {
  params: Promise<{ token: string }>
}

export default async function IntakePage({ params }: Props) {
  const { token } = await params
  const validated = await validateIntakeToken(token)
  if (!validated) notFound()

  const { data: client } = await supabase
    .from('clients')
    .select('id, first_name, last_name')
    .eq('id', validated.client_id)
    .single()

  if (!client) notFound()

  return (
    <main style={page}>
      <div style={card}>
        <div style={header}>
          <p style={brandLabel}>Prosper with Em</p>
          <h1 style={title}>Welcome, {client.first_name}! 🌸</h1>
          <p style={subtitle}>
            Before our call, I&apos;d love to learn a little more about you. This helps me
            show up fully prepared so we can make the most of our time together.
          </p>
          <p style={meta}>Takes about 5 minutes. Your answers are private — just between us.</p>
        </div>

        <IntakeForm token={token} clientId={client.id} firstName={client.first_name} />
      </div>
    </main>
  )
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#F7F1ED',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '48px 16px',
}

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  maxWidth: '640px',
  width: '100%',
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  backgroundColor: '#640015',
  padding: '40px',
  color: '#F7F1ED',
}

const brandLabel: React.CSSProperties = {
  fontFamily: 'var(--font-heading, Georgia, serif)',
  fontSize: '14px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  opacity: 0.75,
  margin: '0 0 16px',
}

const title: React.CSSProperties = {
  fontFamily: 'var(--font-heading, Georgia, serif)',
  fontSize: '28px',
  fontWeight: 500,
  margin: '0 0 12px',
  color: '#F7F1ED',
}

const subtitle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  opacity: 0.92,
}

const meta: React.CSSProperties = {
  fontSize: '13px',
  opacity: 0.7,
  margin: 0,
}
