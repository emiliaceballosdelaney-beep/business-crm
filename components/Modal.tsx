import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(42,35,24,0.45)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 14, padding: 28, maxWidth: 520, width: '100%',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(42,35,24,0.2)',
          animation: 'fadeIn 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 400 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
