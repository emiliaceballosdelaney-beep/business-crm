'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { isToday, isYesterday, format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import type { GmailMessageSummary, GmailMessageFull, GmailDraftSummary } from '@/lib/google'
import InboxReadingPane, { parseFromHeader } from './InboxReadingPane'
import InboxMessageRow from './InboxMessageRow'
import InboxSearchBar from './InboxSearchBar'
import InboxDraftsList from './InboxDraftsList'

export type InboxClient = { id: string; first_name: string; last_name: string; email: string | null }
type Folder = 'inbox' | 'starred' | 'archived' | 'all' | 'drafts' | 'trash'

const FOLDERS: { key: Folder; label: string }[] = [
  { key: 'inbox',    label: 'Inbox'    },
  { key: 'starred',  label: 'Starred'  },
  { key: 'archived', label: 'Archived' },
  { key: 'all',      label: 'All Mail' },
  { key: 'drafts',   label: 'Drafts'   },
  { key: 'trash',    label: 'Trash'    },
]

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (isToday(d))     return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

const SHELL: React.CSSProperties = {
  display: 'flex', border: '1px solid #debfbf', borderRadius: 12,
  overflow: 'hidden', minHeight: 560, backgroundColor: 'white',
}

export default function InboxTab({ clients }: { clients: InboxClient[] }) {
  const [folder, setFolder]             = useState<Folder>('inbox')
  const [messages, setMessages]         = useState<GmailMessageSummary[]>([])
  const [selected, setSelected]         = useState<GmailMessageSummary | null>(null)
  const [fullMessage, setFullMessage]   = useState<GmailMessageFull | null>(null)
  const [loading, setLoading]           = useState(true)
  const [bodyLoading, setBodyLoading]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [loggedIds, setLoggedIds]       = useState<Set<string>>(new Set())
  const [logging, setLogging]           = useState(false)
  const [labelsMap, setLabelsMap]       = useState<Record<string, string[]>>({})
  const [savingLabels, setSavingLabels] = useState(false)
  const [tagFilter, setTagFilter]       = useState<string | null>(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [debouncedQ, setDebouncedQ]     = useState('')
  const [drafts, setDrafts]             = useState<GmailDraftSummary[]>([])
  const [thread, setThread]             = useState<GmailMessageFull[] | null>(null)
  const threadCacheRef                  = useRef<Map<string, GmailMessageFull[]>>(new Map())

  const loadMessages = useCallback((f: Folder) => {
    setLoading(true)
    setSelected(null)
    setMessages([])
    fetch(`/api/gmail/messages?folder=${f}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        const msgs: GmailMessageSummary[] = data.messages ?? []
        setMessages(msgs)
        if (msgs.length) {
          setSelected(msgs[0])
          const ids = msgs.map(m => m.id).join(',')
          fetch(`/api/gmail/labels?messageIds=${ids}`)
            .then(r => r.json())
            .then(map => setLabelsMap(map))
            .catch(() => {})
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    if (debouncedQ) {
      setLoading(true); setSelected(null); setMessages([])
      fetch(`/api/gmail/messages?q=${encodeURIComponent(debouncedQ)}`)
        .then(r => r.json())
        .then(data => { if (data.error) throw new Error(data.error); setMessages(data.messages ?? []) })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else if (folder === 'drafts') {
      setLoading(true); setSelected(null); setMessages([])
      fetch('/api/gmail/drafts')
        .then(r => r.json())
        .then(data => setDrafts(data.drafts ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      loadMessages(folder)
    }
  }, [folder, debouncedQ, loadMessages])

  useEffect(() => {
    if (!selected) return
    setFullMessage(null)
    setThread(null)
    setBodyLoading(true)
    fetch(`/api/gmail/messages?messageId=${selected.id}`)
      .then(r => r.json())
      .then(data => {
        setFullMessage(data as GmailMessageFull)
        const cached = threadCacheRef.current.get(selected.threadId)
        if (cached) {
          setThread(cached)
        } else {
          fetch(`/api/gmail/thread?threadId=${selected.threadId}`)
            .then(r => r.json())
            .then(tdata => {
              const msgs = (tdata.messages ?? []) as GmailMessageFull[]
              threadCacheRef.current.set(selected.threadId, msgs)
              setThread(msgs)
            })
            .catch(() => setThread(null))
        }
      })
      .catch(() => {})
      .finally(() => setBodyLoading(false))

    if (selected.isUnread) {
      fetch('/api/gmail/messages', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selected.id, action: 'mark_read' }),
      }).catch(() => {})
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, isUnread: false } : m))
      setSelected(prev => prev ? { ...prev, isUnread: false } : prev)
    }
  }, [selected?.id])

  function matchClient(email: string): InboxClient | null {
    return clients.find(c => c.email?.toLowerCase() === email.toLowerCase()) ?? null
  }

  async function handleLog(client: InboxClient) {
    if (!selected) return
    setLogging(true)
    await fetch('/api/interactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startup_id: PROSPER_STARTUP_ID, client_id: client.id, interaction_type: 'email', title: selected.subject || '(no subject)', body: selected.snippet, occurred_at: selected.date }),
    })
    setLoggedIds(prev => { const s = new Set(prev); s.add(selected.id); return s })
    setLogging(false)
  }

  function handleArchive(id: string) {
    fetch('/api/gmail/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: id, action: 'archive' }) }).catch(() => {})
    const idx = messages.findIndex(m => m.id === id)
    setMessages(prev => prev.filter(m => m.id !== id))
    setSelected(messages[idx + 1] ?? messages[idx - 1] ?? null)
  }

  function handleTrash(id: string) {
    fetch('/api/gmail/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: id, action: 'trash' }) }).catch(() => {})
    const idx = messages.findIndex(m => m.id === id)
    setMessages(prev => prev.filter(m => m.id !== id))
    setSelected(messages[idx + 1] ?? messages[idx - 1] ?? null)
  }

  function handleToggleRead(id: string, isUnread: boolean) {
    fetch('/api/gmail/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: id, action: isUnread ? 'mark_read' : 'mark_unread' }) }).catch(() => {})
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isUnread: !isUnread } : m))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, isUnread: !isUnread } : prev)
  }

  function handleStar(id: string, isStarred: boolean) {
    fetch('/api/gmail/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: id, action: isStarred ? 'unstar' : 'star' }) }).catch(() => {})
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !isStarred } : m))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, isStarred: !isStarred } : prev)
  }

  function handleOpenDraft(draft: GmailDraftSummary) {
    window.dispatchEvent(new CustomEvent('inbox:openCompose', {
      detail: { to: draft.to, subject: draft.subject, draftId: draft.draftId }
    }))
  }

  function handleDeleteDraft(draftId: string) {
    fetch(`/api/gmail/drafts?draftId=${draftId}`, { method: 'DELETE' }).catch(() => {})
    setDrafts(prev => prev.filter(d => d.draftId !== draftId))
  }

  async function handleUpdateLabels(messageId: string, labels: string[]) {
    setSavingLabels(true)
    setLabelsMap(prev => ({ ...prev, [messageId]: labels }))
    await fetch('/api/gmail/labels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, labels }) }).catch(() => {})
    setSavingLabels(false)
  }

  const allTags = Array.from(new Set(Object.values(labelsMap).flat())).sort()
  const visibleMessages = tagFilter ? messages.filter(m => (labelsMap[m.id] ?? []).includes(tagFilter)) : messages

  if (loading) return (
    <div style={{ ...SHELL, alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} style={{ color: '#AB655C', animation: 'spin 1s linear infinite' }} />
    </div>
  )
  if (error === 'Google not connected') return (
    <div style={{ ...SHELL, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#574141' }}>Connect Google to sync your <strong>emilia@prosperwithem.com</strong> inbox here.</p>
      <a href="/meetings" style={{ color: '#640015', fontFamily: 'var(--font-body)', fontSize: 14, textDecoration: 'underline' }}>Go to Meetings → Connect Google</a>
    </div>
  )

  return (
    <div>
      <InboxSearchBar value={searchQuery} onChange={setSearchQuery} />
      {/* Folder tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E0DC', marginBottom: 16 }}>
        {FOLDERS.map(f => (
          <button key={f.key} onClick={() => { setFolder(f.key); setTagFilter(null) }}
            style={{ padding: '8px 18px', background: 'none', border: 'none', borderBottom: folder === f.key ? '2px solid #640015' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: folder === f.key ? 600 : 400, color: folder === f.key ? '#640015' : '#9c9490', marginBottom: -1 }}
          >{f.label}</button>
        ))}
      </div>

      <div style={SHELL}>
        {/* Left: message list */}
        <div style={{ width: 320, minWidth: 320, borderRight: '1px solid #f0e8e8', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Tag filter pills */}
          {allTags.length > 0 && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f5eeed', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <button onClick={() => setTagFilter(null)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, border: '1px solid #debfbf', background: tagFilter === null ? '#640015' : 'transparent', color: tagFilter === null ? 'white' : '#574141', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>All</button>
              {allTags.map(t => (
                <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, border: '1px solid #debfbf', background: tagFilter === t ? '#640015' : 'transparent', color: tagFilter === t ? 'white' : '#574141', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{t}</button>
              ))}
            </div>
          )}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {folder === 'drafts' && !debouncedQ ? (
              <InboxDraftsList drafts={drafts} onSelect={handleOpenDraft} onDelete={handleDeleteDraft} />
            ) : !visibleMessages.length ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#9c9490' }}>
                {tagFilter ? `No messages tagged "${tagFilter}"` : 'No messages'}
              </div>
            ) : visibleMessages.map(msg => {
              const { name, email } = parseFromHeader(msg.from)
              const client = matchClient(email)
              return (
                <InboxMessageRow key={msg.id} msg={msg} isSelected={selected?.id === msg.id}
                  displayName={client ? `${client.first_name} ${client.last_name}` : name}
                  client={client} labels={labelsMap[msg.id] ?? []} dateStr={shortDate(msg.date)}
                  onClick={() => setSelected(msg)}
                  onStar={e => { e.stopPropagation(); handleStar(msg.id, msg.isStarred ?? false) }}
                />
              )
            })}
          </div>
        </div>

        {/* Right: reading pane */}
        {selected ? (
          <InboxReadingPane selected={selected} fullMessage={fullMessage} bodyLoading={bodyLoading}
            matchedClient={matchClient(parseFromHeader(selected.from).email)}
            isLogged={loggedIds.has(selected.id)} logging={logging}
            labels={labelsMap[selected.id] ?? []} savingLabels={savingLabels}
            thread={thread}
            onLog={() => { const c = matchClient(parseFromHeader(selected.from).email); if (c) handleLog(c) }}
            onArchive={() => handleArchive(selected.id)}
            onTrash={() => handleTrash(selected.id)}
            onToggleRead={() => handleToggleRead(selected.id, selected.isUnread ?? false)}
            onUpdateLabels={labels => handleUpdateLabels(selected.id, labels)}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#9c9490' }}>
              {folder === 'drafts' ? 'Select a draft to edit' : 'All caught up'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
