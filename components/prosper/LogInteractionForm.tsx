'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { INTERACTION_TYPES } from '@/lib/constants'

interface LogInteractionFormProps {
  clientId: string
  startupId: string
}

export default function LogInteractionForm({ clientId, startupId }: LogInteractionFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    interaction_type: 'call',
    title: '',
    body: '',
    occurred_at: new Date().toISOString().slice(0, 16),
  })
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            startup_id: startupId,
            interaction_type: form.interaction_type,
            title: form.title.trim(),
            body: form.body.trim() || null,
            occurred_at: new Date(form.occurred_at).toISOString(),
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Failed to save')
          return
        }

        setOpen(false)
        setForm({
          interaction_type: 'call',
          title: '',
          body: '',
          occurred_at: new Date().toISOString().slice(0, 16),
        })
        router.refresh()
      } catch {
        setError('Something went wrong')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--background)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--foreground)',
    fontSize: 14,
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="primary">
          <Plus size={14} />
          Log Interaction
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
          <DialogDescription>Record a call, session, email, or note for this client.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              Type
            </label>
            <select
              value={form.interaction_type}
              onChange={(e) => setForm((f) => ({ ...f, interaction_type: e.target.value }))}
              style={inputStyle}
            >
              {INTERACTION_TYPES.filter((t) =>
                !['stripe_payment', 'calendly_booking'].includes(t.value)
              ).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              Title <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Session 2 — Budget review"
              style={inputStyle}
              autoFocus
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              Notes
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="What happened, what was discussed, action items..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={form.occurred_at}
              onChange={(e) => setForm((f) => ({ ...f, occurred_at: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm">Cancel</Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Interaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
