'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { getProfileAvatar } from '@/lib/profile'
import AvatarUploadDialog from './AvatarUploadDialog'

export default function TopBar() {
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)
  const [dialogOpen, setDialogOpen]   = useState(false)

  useEffect(() => {
    getProfileAvatar().then(url => { if (url) setAvatarUrl(url) })
  }, [])

  return (
    <div style={{
      height: 80,
      backgroundColor: 'var(--background)',
      borderBottom: '1px solid #D9CDC5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 40px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10,
      gap: 24,
    }}>
      <button style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Search size={28} color="#640015" strokeWidth={1.75} />
      </button>

      <button
        onClick={() => setDialogOpen(true)}
        title="Update profile photo"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          backgroundColor: '#640015',
          border: 'none', cursor: 'pointer', padding: 0,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            color: '#F7F1ED',
            fontFamily: 'var(--font-heading)', fontSize: 16,
            fontWeight: 600, letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}>
            EM
          </span>
        )}
      </button>

      <AvatarUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={setAvatarUrl}
      />
    </div>
  )
}
