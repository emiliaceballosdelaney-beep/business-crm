'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { INTERACTION_TYPES } from '@/lib/constants'
import type { Interaction } from '@/lib/supabase'

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

export default function InteractionActions({ interaction }: { interaction: Interaction }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    interaction_type: interaction.interaction_type,
    title: interaction.title,
    body: interaction.body ?? '',
    occurred_at: format(new Date(interaction.occurred_at), "yyyy-MM-dd'T'HH:mm"),
  })
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    if (!window.confirm('Delete this interaction? This cannot be undone.')) return
    startTransition(async () => {
      await fetch(`/api/interactions/${interaction.id}`, { method: 'DELETE' })
      router.refresh()
    })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.title.trim()) { setError('Title is required'); return }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/interactions/${interaction.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
        setEditOpen(false)
        router.refresh()
      } catch {
        setError('Something went wrong')
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => { setError(null); setEditOpen(true) }}
          className="rounded p-1 hover:bg-black/5 transition-colors"
          title="Edit"
        >
          <Pencil size={11} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded p-1 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={11} style={{ color: '#ef4444' }} />
        </button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Interaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Type</label>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Title <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={inputStyle}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Notes</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Date &amp; Time</label>
              <input
                type="datetime-local"
                value={form.occurred_at}
                onChange={(e) => setForm((f) => ({ ...f, occurred_at: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="sm">Cancel</Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
