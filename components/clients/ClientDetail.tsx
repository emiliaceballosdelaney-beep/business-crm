'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Calendar, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { deleteClient } from '@/lib/deleteClient'
import { CLIENT_STAGE_STYLES } from '@/lib/constants'
import OverviewTab from './OverviewTab'
import ActivityTab from './ActivityTab'
import MeetingsTab from './MeetingsTab'
import TasksTab from './TasksTab'
import ClientEmailsTab from '@/components/email/ClientEmailsTab'
import SendEmailModal from '@/components/email/SendEmailModal'
import type { ClientDetailRow, GoalEntry, InteractionRow, MeetingDetailRow, TaskDetailRow } from './types'
import InteractionForm from '@/components/forms/InteractionForm'
import TaskForm from '@/components/forms/TaskForm'
import MeetingForm from '@/components/forms/MeetingForm'

type Tab = 'overview' | 'activity' | 'meetings' | 'tasks' | 'emails'

export type EditValues = {
  first_name: string
  last_name: string
  email: string
  phone: string
  start_date: string
  end_date: string
  location: string
  occupation: string
  source: string
  referred_by: string
  notes: string
  income_range: string
  income_source: string
  savings: string
  investments: string
  debt_notes: string
  finance_tools: string[]
  goals: GoalEntry[]
  challenges: string
}

interface Props {
  client: ClientDetailRow
  referredByName: string | null
  interactions: InteractionRow[]
  meetings: MeetingDetailRow[]
  tasks: TaskDetailRow[]
}

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', discovery: 'Discovery', active: 'Active', paused: 'Paused', cold: 'Cold',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

function freshEdit(client: ClientDetailRow): EditValues {
  return {
    first_name:    client.first_name,
    last_name:     client.last_name,
    email:         client.email         ?? '',
    phone:         client.phone         ?? '',
    start_date:    client.start_date    ?? '',
    end_date:      client.end_date      ?? '',
    location:      client.location      ?? '',
    occupation:    client.occupation    ?? '',
    source:        client.source        ?? '',
    referred_by:   client.referred_by   ?? '',
    notes:         client.notes         ?? '',
    income_range:  client.income_range  ?? '',
    income_source: client.income_source ?? '',
    savings:       client.savings       ?? '',
    investments:   client.investments   ?? '',
    debt_notes:    client.debt_notes    ?? '',
    finance_tools: client.finance_tools ?? [],
    goals:         client.goals         ?? [],
    challenges:    client.challenges    ?? '',
  }
}

export default function ClientDetail({ client, referredByName, interactions, meetings, tasks }: Props) {
  const router = useRouter()
  const [tab, setTab]                         = useState<Tab>('overview')
  const [showInteraction, setShowInteraction] = useState(false)
  const [showTask, setShowTask]               = useState(false)
  const [showMeeting, setShowMeeting]         = useState(false)
  const [showSendEmail, setShowSendEmail]     = useState(false)
  const [isEditing, setIsEditing]             = useState(false)
  const [isSaving, setIsSaving]               = useState(false)
  const [saveError, setSaveError]             = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting]           = useState(false)
  // liveClient tracks the last-saved state so the display updates immediately after save
  const [liveClient, setLiveClient]           = useState<ClientDetailRow>(client)
  const [editValues, setEditValues]           = useState<EditValues>(() => freshEdit(client))

  const isDirty = isEditing && (
    editValues.first_name    !== liveClient.first_name          ||
    editValues.last_name     !== liveClient.last_name           ||
    editValues.email         !== (liveClient.email         ?? '') ||
    editValues.phone         !== (liveClient.phone         ?? '') ||
    editValues.start_date    !== (liveClient.start_date    ?? '') ||
    editValues.end_date      !== (liveClient.end_date      ?? '') ||
    editValues.location      !== (liveClient.location      ?? '') ||
    editValues.occupation    !== (liveClient.occupation    ?? '') ||
    editValues.source        !== (liveClient.source        ?? '') ||
    editValues.referred_by   !== (liveClient.referred_by   ?? '') ||
    editValues.notes         !== (liveClient.notes         ?? '') ||
    editValues.income_range  !== (liveClient.income_range  ?? '') ||
    editValues.income_source !== (liveClient.income_source ?? '') ||
    editValues.savings       !== (liveClient.savings       ?? '') ||
    editValues.investments   !== (liveClient.investments   ?? '') ||
    editValues.debt_notes    !== (liveClient.debt_notes    ?? '') ||
    editValues.challenges    !== (liveClient.challenges    ?? '') ||
    JSON.stringify(editValues.finance_tools) !== JSON.stringify(liveClient.finance_tools ?? []) ||
    JSON.stringify(editValues.goals)         !== JSON.stringify(liveClient.goals         ?? [])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditChange = (field: keyof EditValues, value: any) =>
    setEditValues(prev => ({ ...prev, [field]: value }))

  const handleCancel = () => {
    setEditValues(freshEdit(liveClient))
    setSaveError(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    const first = editValues.first_name.trim()
    const last  = editValues.last_name.trim()
    const { data: updated, error } = await supabase.from('clients').update({
      first_name:    first,
      last_name:     last,
      name:          [first, last].filter(Boolean).join(' '),
      email:         editValues.email         || null,
      phone:         editValues.phone         || null,
      start_date:    editValues.start_date    || null,
      end_date:      editValues.end_date      || null,
      location:      editValues.location      || null,
      occupation:    editValues.occupation    || null,
      source:        editValues.source        || null,
      referred_by:   editValues.referred_by   || null,
      notes:         editValues.notes         || null,
      income_range:  editValues.income_range  || null,
      income_source: editValues.income_source || null,
      savings:       editValues.savings       || null,
      investments:   editValues.investments   || null,
      debt_notes:    editValues.debt_notes    || null,
      challenges:    editValues.challenges    || null,
      finance_tools: editValues.finance_tools.length > 0 ? editValues.finance_tools : null,
      goals:         editValues.goals.length  > 0 ? editValues.goals : null,
    }).eq('id', client.id).select('id')
    setIsSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    if (!updated || updated.length === 0) {
      setSaveError('Save failed — no rows were updated. Please try again.')
      return
    }
    // Update local state immediately so display reflects the save without waiting for router.refresh()
    const saved: ClientDetailRow = {
      ...liveClient,
      first_name:    first,
      last_name:     last,
      name:          [first, last].filter(Boolean).join(' '),
      email:         editValues.email         || null,
      phone:         editValues.phone         || null,
      start_date:    editValues.start_date    || null,
      end_date:      editValues.end_date      || null,
      location:      editValues.location      || null,
      occupation:    editValues.occupation    || null,
      source:        editValues.source        || null,
      referred_by:   editValues.referred_by   || null,
      notes:         editValues.notes         || null,
      income_range:  editValues.income_range  || null,
      income_source: editValues.income_source || null,
      savings:       editValues.savings       || null,
      investments:   editValues.investments   || null,
      debt_notes:    editValues.debt_notes    || null,
      challenges:    editValues.challenges    || null,
      finance_tools: editValues.finance_tools.length > 0 ? editValues.finance_tools : null,
      goals:         editValues.goals.length  > 0 ? editValues.goals : null,
    }
    setLiveClient(saved)
    setEditValues(freshEdit(saved))
    setIsEditing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const err = await deleteClient(client.id)
    setIsDeleting(false)
    if (err) {
      setShowDeleteConfirm(false)
      setSaveError(`Delete failed: ${err}`)
      return
    }
    router.push('/clients')
  }

  const btnStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
    border: 'none', backgroundColor: '#640015', color: 'white',
    cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', whiteSpace: 'nowrap',
  }
  const cancelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
    border: '1px solid #debfbf', backgroundColor: 'transparent', color: '#9c9490',
    cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.05em', whiteSpace: 'nowrap',
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'activity',  label: 'Activity' },
    { key: 'meetings',  label: 'Meetings' },
    { key: 'tasks',     label: 'Tasks' },
    { key: 'emails',    label: 'Emails' },
  ]

  return (
    <div style={{ padding: '24px 40px' }}>
      <InteractionForm isOpen={showInteraction} onClose={() => setShowInteraction(false)} clientId={client.id} />
      <TaskForm        isOpen={showTask}        onClose={() => setShowTask(false)}        prefillClientId={client.id} />
      <MeetingForm     isOpen={showMeeting}     onClose={() => setShowMeeting(false)}     prefillClientId={client.id} />
      <SendEmailModal  isOpen={showSendEmail}   onClose={() => setShowSendEmail(false)}   prefillClientId={client.id} />

      <div>
        <Link
          href="/clients"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9c9490', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 24 }}
        >
          <ArrowLeft size={14} />
          Back to Clients
        </Link>

        {/* Header block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#640015', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18, color: 'white' }}>
                {initials(liveClient.name)}
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: '#4D4D4D', margin: '0 0 4px 0', lineHeight: 1.2 }}>
                  {liveClient.name}
                </h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(() => { const s = CLIENT_STAGE_STYLES[liveClient.lead_stage]; return (
                    <span style={{ backgroundColor: s?.bg ?? '#f4f4f5', color: s?.text ?? '#52525b', fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                      {STAGE_LABELS[liveClient.lead_stage] ?? liveClient.lead_stage}
                    </span>
                  )})()}
                  {liveClient.service_type && (
                    <span style={{ backgroundColor: '#F5E8EA', color: '#3d0009', fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                      {liveClient.service_type.charAt(0).toUpperCase() + liveClient.service_type.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginTop: 16, fontSize: 12, color: '#9c9490', fontFamily: 'var(--font-body)' }}>
              {liveClient.email && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={14} /> {liveClient.email}</div>}
              {liveClient.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {liveClient.phone}</div>}
              {liveClient.start_date && !isNaN(new Date(liveClient.start_date).getTime()) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> Joined {format(new Date(liveClient.start_date + 'T12:00:00'), 'MMM yyyy')}
                </div>
              )}
            </div>
          </div>

          {/* Delete contact — top-right of header */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {!showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1px solid #fecaca', backgroundColor: 'transparent', color: '#b91c1c', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.03em' }}
              >
                <Trash2 size={13} />
                Delete Contact
              </button>
            )}
            {showDeleteConfirm && (
              <>
                <span style={{ fontSize: 12, color: '#b91c1c', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>Delete this contact?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: 'none', backgroundColor: '#b91c1c', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: isDeleting ? 0.7 : 1 }}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1px solid #debfbf', backgroundColor: 'transparent', color: '#9c9490', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info chips */}
        {(() => {
          const clientSince    = liveClient.start_date ? format(new Date(liveClient.start_date + 'T12:00:00'), 'MMM yyyy') : null
          const sessionCount   = interactions.length
          const lastInteraction = interactions[0]
          const lastContactDays = lastInteraction ? Math.floor((Date.now() - new Date(lastInteraction.occurred_at).getTime()) / 86400000) : null
          const lastContactText = lastContactDays === null ? null : lastContactDays === 0 ? 'today' : lastContactDays === 1 ? 'yesterday' : `${lastContactDays} days ago`
          const chipBase: React.CSSProperties = { padding: '8px 16px', backgroundColor: '#F7F1ED', border: '1px solid #E8E0DC', borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <div style={{ ...chipBase, color: '#9c9490' }}><span>🗓</span> {clientSince ? `Client since ${clientSince}` : 'No start date'}</div>
              <div style={{ ...chipBase, color: '#9c9490' }}><span>✔</span> {sessionCount} session{sessionCount !== 1 ? 's' : ''} completed</div>
              <div style={{ ...chipBase, color: '#AB655C' }}><span>💬</span> Last contact {lastContactText ?? '—'}</div>
            </div>
          )
        })()}

        {/* Tab bar */}
        <div style={{ borderBottom: '1px solid #debfbf', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); if (t.key !== 'overview') handleCancel() }}
                style={{
                  fontFamily: 'var(--font-heading)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 0 12px 0', marginBottom: -1,
                  color: tab === t.key ? '#3d0009' : '#9c9490',
                  borderBottom: tab === t.key ? '2px solid #3d0009' : '2px solid transparent',
                  fontWeight: tab === t.key ? 600 : 500, transition: 'color 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {saveError && (
              <span style={{ fontSize: 11, color: '#b91c1c', fontFamily: 'var(--font-body)', maxWidth: 280 }}>{saveError}</span>
            )}
            {tab === 'overview' && !isEditing && <button onClick={() => setIsEditing(true)} style={btnStyle}>Edit Contact</button>}
            {tab === 'overview' && isEditing && (
              <>
                {isDirty && <button onClick={handleSave} disabled={isSaving} style={{ ...btnStyle, opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Saving…' : 'Save'}</button>}
                <button onClick={handleCancel} style={cancelStyle}>Cancel</button>
              </>
            )}
            {tab === 'activity'  && <button onClick={() => setShowInteraction(true)}                        style={btnStyle}>Log Interaction</button>}
            {tab === 'meetings'  && <button onClick={() => setShowMeeting(true)}                              style={btnStyle}>Schedule Meeting</button>}
            {tab === 'tasks'     && <button onClick={() => setShowTask(true)}                                 style={btnStyle}>Add Task</button>}
            {tab === 'emails'    && <button onClick={() => setShowSendEmail(true)}                          style={btnStyle}>Send Email</button>}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <OverviewTab
            client={liveClient}
            referredByName={referredByName}
            meetings={meetings}
            tasks={tasks}
            isEditing={isEditing}
            editValues={editValues}
            onSwitchTab={(tab) => setTab(tab as Tab)}
            onEditChange={handleEditChange}
          />
        )}
        {tab === 'activity'  && <ActivityTab interactions={interactions} clientId={client.id} />}
        {tab === 'meetings'  && <MeetingsTab meetings={meetings} clientId={client.id} />}
        {tab === 'tasks'     && <TasksTab tasks={tasks} clientId={client.id} />}
        {tab === 'emails'    && <ClientEmailsTab clientId={client.id} />}
      </div>
    </div>
  )
}
