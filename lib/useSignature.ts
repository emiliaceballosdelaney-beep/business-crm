'use client'
import { useState, useEffect, useCallback } from 'react'

const LOGO_ABSOLUTE = 'https://startup-dashboard-five.vercel.app/prosper_with_em_logo_transparent.png'
export const DEFAULT_SIG_TEXT = 'Emilia Ceballos\nprosperwith.com'

export function buildSignatureHtml(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const bodyHtml = lines.map((line, i) => {
    if (i === 0) return `<strong>${line}</strong>`
    if (/^https?:\/\//.test(line) || /\.[a-z]{2,}$/.test(line)) {
      const href = line.startsWith('http') ? line : `https://${line}`
      return `<a href="${href}" style="color:#640015;text-decoration:none;">${line}</a>`
    }
    return line
  }).join('<br>')

  return `<br><br>--<br><img src="${LOGO_ABSOLUTE}" alt="Prosper with Em" style="height:40px;width:auto;display:block;margin-bottom:6px;">${bodyHtml}`
}

export function useSignature() {
  const [text, setText] = useState(DEFAULT_SIG_TEXT)

  useEffect(() => {
    const stored = localStorage.getItem('crmSignatureText')
    if (stored) setText(stored)
  }, [])

  const save = useCallback((newText: string) => {
    localStorage.setItem('crmSignatureText', newText)
    setText(newText)
  }, [])

  return { text, signatureHtml: buildSignatureHtml(text), save }
}
