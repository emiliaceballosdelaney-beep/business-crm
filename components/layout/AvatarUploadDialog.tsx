'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'
import { setProfileAvatar } from '@/lib/profile'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (url: string) => void
}

export default function AvatarUploadDialog({ open, onOpenChange, onSaved }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  const handleSave = async () => {
    if (!file) return
    setSaving(true)
    setError(null)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${PROSPER_STARTUP_ID}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('Avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadErr) throw uploadErr

      const { data } = supabase.storage.from('Avatars').getPublicUrl(path)
      const url = data.publicUrl
      await setProfileAvatar(url)
      onSaved(url)
      onOpenChange(false)
      setPreview(null)
      setFile(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (saving) return
    setPreview(null)
    setFile(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) handleClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update profile photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          {/* Preview */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ backgroundColor: '#640015' }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: '#F7F1ED', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, letterSpacing: '0.04em' }}>
                EM
              </span>
            )}
          </div>

          {/* File input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-md border border-[#debfbf] text-[12px] font-label text-[#640015] hover:bg-[#F7F1ED] transition-colors"
          >
            {preview ? 'Choose different photo' : 'Choose photo'}
          </button>

          {error && (
            <p className="text-red-500 text-[12px] font-body text-center">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[#E8E0DC]">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-1.5 rounded-md text-[12px] font-label text-[#574141] hover:bg-[#F7F1ED] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!file || saving}
            className="px-4 py-1.5 rounded-md bg-[#640015] text-white text-[12px] font-label hover:bg-[#3d0009] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
