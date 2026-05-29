'use client'

import { useState, useEffect } from 'react'
import EmailQueueTab from './EmailQueueTab'
import InboxTab, { type InboxClient } from './InboxTab'
import EmailTemplatesTab from './EmailTemplatesTab'
import ComposeModal from './ComposeModal'

export type QueueRow = {
  id: string
  client_id: string
  workflow_key: string
  step_key: string
  template_key: string
  send_at: string
  status: string
  clients: { first_name: string; last_name: string } | null
}

// Kept for ClientEmailsTab which still uses it
export type HistoryRow = {
  id: string
  client_id: string
  template_key: string
  subject: string
  to_email: string
  sent_at: string
  clients: { first_name: string; last_name: string } | null
}

type Tab = 'inbox' | 'queue' | 'templates'

interface Props {
  queue: QueueRow[]
  clients: InboxClient[]
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'inbox',     label: 'Inbox' },
  { key: 'queue',     label: 'Queue' },
  { key: 'templates', label: 'Templates' },
]

export default function EmailsPage({ queue, clients }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('inbox')
  const [localQueue, setLocalQueue] = useState<QueueRow[]>(queue)
  const [showCompose, setShowCompose] = useState(false)
  const [composeInitial, setComposeInitial] = useState<{ to?: string; subject?: string; body?: string; draftId?: string } | undefined>(undefined)

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { to?: string; subject?: string; body?: string; draftId?: string }
      setComposeInitial(detail)
      setShowCompose(true)
    }
    window.addEventListener('inbox:openCompose', handler)
    return () => window.removeEventListener('inbox:openCompose', handler)
  }, [])

  function handleCancel(id: string) {
    setLocalQueue(prev => prev.filter(row => row.id !== id))
  }

  return (
    <div className="p-8 md:p-10 mb-10">
      {/* Page header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">Emails</h1>
          <p className="font-body text-[13px] text-[#574141]/70 mt-0.5">Your inbox, drafts, and client outreach in one place.</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          style={{
            backgroundColor: '#640015',
            color: '#F7F1ED',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3d0009' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#640015' }}
        >
          Compose New Email
        </button>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          borderBottom: '1px solid #E8E0DC',
          marginBottom: 24,
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                fontWeight: active ? 600 : 400,
                color: active ? '#3d0009' : '#9c9490',
                paddingBottom: 12,
                borderBottom: active ? '2px solid #3d0009' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'inbox'     && <InboxTab clients={clients} />}
      {activeTab === 'queue'     && <EmailQueueTab queue={localQueue} onCancel={handleCancel} />}
      {activeTab === 'templates' && <EmailTemplatesTab />}

      <ComposeModal isOpen={showCompose} onClose={() => setShowCompose(false)} initial={composeInitial} />
    </div>
  )
}
