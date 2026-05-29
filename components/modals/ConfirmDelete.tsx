'use client'

import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  itemName?: string
  entityType: string
}

export default function ConfirmDelete({ isOpen, onClose, onConfirm, itemName, entityType }: Props) {
  const [deleting, setDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setDeleting(true)
    try { await onConfirm() } finally { setDeleting(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: 'var(--card)', borderRadius: 10, padding: 24, width: 400, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 400, color: '#B91C1C', margin: '0 0 12px 0' }}>
          Delete {entityType}?
        </h2>
        {itemName && (
          <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--foreground)', margin: '0 0 8px 0', fontWeight: 600 }}>
            {itemName}
          </p>
        )}
        <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--muted-foreground)', margin: '0 0 24px 0' }}>
          This can't be undone. The {entityType.toLowerCase()} will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={deleting}
            style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0DC', backgroundColor: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, border: 'none', backgroundColor: '#B91C1C', color: '#fff', cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: 'var(--font-body)' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
