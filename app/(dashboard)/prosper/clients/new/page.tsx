'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

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

export default function NewClientPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [existingClients, setExistingClients] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    financial_stage: '',
    referred_by: '',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/clients?startup_id=${PROSPER_STARTUP_ID}`)
      .then((r) => r.json())
      .then((d) => setExistingClients(d.clients ?? []))
      .catch(() => {})
  }, [])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) { setError('Name is required'); return }

    startTransition(async () => {
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startup_id: PROSPER_STARTUP_ID,
            name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            financial_stage: form.financial_stage || null,
            referred_by: form.referred_by || null,
            notes: form.notes.trim() || null,
            status: 'prospect',
            client_type: 'lead',
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Failed to create client')
          return
        }
        router.push('/prosper/clients')
        router.refresh()
      } catch {
        setError('Something went wrong')
      }
    })
  }

  return (
    <div className="min-h-full px-8 py-6 max-w-xl">
      <Link
        href="/prosper/clients"
        className="mb-6 flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ChevronLeft size={15} />
        Clients
      </Link>

      <h1
        className="mb-6 text-3xl font-light"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}
      >
        Add Client
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
            Name <span style={{ color: 'var(--primary)' }}>*</span>
          </label>
          <input type="text" value={form.name} onChange={set('name')}
            placeholder="Full name" style={inputStyle} autoFocus />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Email</label>
          <input type="email" value={form.email} onChange={set('email')}
            placeholder="email@example.com" style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Phone</label>
          <input type="tel" value={form.phone} onChange={set('phone')}
            placeholder="(555) 000-0000" style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Referred By</label>
          <select value={form.referred_by} onChange={set('referred_by')} style={inputStyle}>
            <option value="">None</option>
            {existingClients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Notes</label>
          <textarea value={form.notes} onChange={set('notes')}
            placeholder="Background, goals, context..." rows={4}
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Client'}
          </Button>
          <Link href="/prosper/clients">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
