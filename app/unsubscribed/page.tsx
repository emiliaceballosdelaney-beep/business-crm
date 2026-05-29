export default function UnsubscribedPage() {
  return (
    <main style={page}>
      <div style={card}>
        <h1 style={title}>You&apos;ve been unsubscribed.</h1>
        <p style={message}>
          You won&apos;t receive any more automated emails from Prosper with Em.
        </p>
        <p style={message}>
          If you change your mind or have questions, you can always reach Em directly at{' '}
          <a href="mailto:hello@prosperwithem.com" style={link}>hello@prosperwithem.com</a>.
        </p>
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
  maxWidth: '480px',
  width: '100%',
  padding: '48px 40px',
  textAlign: 'center' as const,
}

const title: React.CSSProperties = {
  fontFamily: 'var(--font-heading, Georgia, serif)',
  fontSize: '24px',
  color: '#1b1c1c',
  margin: '0 0 16px',
}

const message: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#574141',
  margin: '0 0 12px',
}

const link: React.CSSProperties = { color: '#AB655C' }
