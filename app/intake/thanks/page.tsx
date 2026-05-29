export default function IntakeThanksPage() {
  return (
    <main style={page}>
      <div style={card}>
        <div style={header}>
          <p style={brandLabel}>Prosper with Em</p>
          <h1 style={title}>Thank you so much! 🌸</h1>
        </div>
        <div style={body}>
          <p style={message}>
            I received your intake form and I&apos;m genuinely excited to read through your
            answers before our call. This is going to help us hit the ground running.
          </p>
          <p style={message}>
            Keep an eye on your inbox — I&apos;ll be in touch soon!
          </p>
          <p style={signoff}>With warmth,<br /><strong>Em ✨</strong></p>
        </div>
      </div>
    </main>
  )
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#F7F1ED',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 16px',
}

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  maxWidth: '520px',
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
  textTransform: 'uppercase' as const,
  opacity: 0.75,
  margin: '0 0 16px',
}

const title: React.CSSProperties = {
  fontFamily: 'var(--font-heading, Georgia, serif)',
  fontSize: '28px',
  fontWeight: 500,
  margin: 0,
  color: '#F7F1ED',
}

const body: React.CSSProperties = { padding: '40px' }

const message: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.7',
  color: '#4D4D4D',
  margin: '0 0 16px',
}

const signoff: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.7',
  color: '#4D4D4D',
  marginTop: '24px',
}
