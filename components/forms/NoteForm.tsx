import { useState, useEffect } from 'react'
import { Note, Startup } from '../../lib/supabase'

interface NoteFormProps {
  note?: Note | null // If provided, we're editing; otherwise creating
  startups: Startup[]
  selectedStartupId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void // Called after successful create/update
}

export default function NoteForm({
  note,
  startups,
  selectedStartupId,
  isOpen,
  onClose,
  onSuccess
}: NoteFormProps) {
  const [formData, setFormData] = useState({
    startup_id: selectedStartupId || '',
    content: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens/closes or note changes
  useEffect(() => {
    if (isOpen) {
      if (note) {
        // Editing existing note
        setFormData({
          startup_id: note.startup_id,
          content: note.content,
          tags: note.tags ? note.tags.join(', ') : ''
        })
      } else {
        // Creating new note
        setFormData({
          startup_id: selectedStartupId || '',
          content: '',
          tags: ''
        })
      }
      setError('')
    }
  }, [isOpen, note, selectedStartupId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiEndpoint = note ? `/api/notes/${note.id}` : '/api/notes'
      const method = note ? 'PUT' : 'POST'

      // Parse tags from comma-separated string
      const tagsList = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const requestData: Pick<Note, 'startup_id' | 'content' | 'tags'> = {
        startup_id: formData.startup_id,
        content: formData.content.trim(),
        tags: tagsList.length > 0 ? tagsList : null,
      }

      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save note')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="startup_id" className="form-label">
              Business *
            </label>
            <select
              id="startup_id"
              name="startup_id"
              value={formData.startup_id}
              onChange={handleChange}
              required
              className="form-select"
              disabled={loading}
            >
              <option value="">Select a business</option>
              {startups.map((startup) => (
                <option key={startup.id} value={startup.id}>
                  {startup.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              maxLength={5000}
              className="form-textarea"
              disabled={loading}
              placeholder="Write your note here..."
              style={{ minHeight: '200px' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {formData.content.length}/5000 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
              placeholder="Enter tags separated by commas"
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Separate multiple tags with commas (e.g., idea, important, follow-up)
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.content.trim() || !formData.startup_id}
            >
              {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}