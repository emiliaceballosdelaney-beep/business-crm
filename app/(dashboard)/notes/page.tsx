import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { format } from 'date-fns'
import type { Note } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function getNotes(): Promise<Note[]> {
  try {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('startup_id', PROSPER_STARTUP_ID)
      .order('created_at', { ascending: false })
      .limit(50)
    return data ?? []
  } catch {
    return []
  }
}

function NoteCard({ note }: { note: Note }) {
  const preview = note.content.length > 200 ? note.content.slice(0, 200) + '…' : note.content

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
        {preview}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
        </p>
        {note.tags && note.tags.length > 0 && (
          <>
            <span style={{ color: 'var(--muted-foreground)' }}>·</span>
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                {tag}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default async function NotesPage() {
  const notes = await getNotes()

  // Group by month
  const groups: { label: string; items: Note[] }[] = []
  for (const note of notes) {
    const label = format(new Date(note.created_at), 'MMMM yyyy')
    const last = groups[groups.length - 1]
    if (last?.label === label) {
      last.items.push(note)
    } else {
      groups.push({ label, items: [note] })
    }
  }

  return (
    <div className="min-h-full px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline font-bold text-[36px] text-[#4D4D4D]">
            Notes
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {notes.length} saved
          </p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No notes yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {group.label}
              </h2>
              <div className="flex flex-col gap-2">
                {group.items.map((n) => <NoteCard key={n.id} note={n} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
