'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from 'lucide-react'
import { useEffect } from 'react'

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, unknown>) =>
            attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
})

const BTN: React.CSSProperties = {
  background: 'transparent', border: '1px solid transparent',
  borderRadius: 5, padding: '3px 7px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', color: '#574141',
}
const BTN_ACTIVE: React.CSSProperties = {
  ...BTN, backgroundColor: '#f5e8ea', borderColor: '#debfbf', color: '#640015',
}
const DIVIDER: React.CSSProperties = {
  width: 1, height: 16, backgroundColor: '#E8E0DC', margin: '0 3px', flexShrink: 0,
}

function Btn({ onClick, active, children }: {
  onClick: () => void; active: boolean; children: React.ReactNode
}) {
  return (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }} style={active ? BTN_ACTIVE : BTN}>
      {children}
    </button>
  )
}

export default function RichTextEditor({ content, onChange, placeholder, disabled, minHeight = 160 }: {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: number
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, FontSize],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: `min-height: ${minHeight}px`,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  })

  useEffect(() => {
    if (editor && content === '') editor.commands.clearContent()
  }, [content, editor])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #debfbf', borderRadius: 8, backgroundColor: 'white', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '5px 8px', borderBottom: '1px solid #f0e8e8', backgroundColor: '#fdfaf9', flexWrap: 'wrap' }}>
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <UnderlineIcon size={13} />
        </Btn>
        <div style={DIVIDER} />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={13} />
        </Btn>
        <div style={DIVIDER} />
        <select
          style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#574141', border: '1px solid #E8E0DC', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', outline: 'none', backgroundColor: 'white' }}
          onChange={e => {
            const size = e.target.value
            if (size) editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
            else editor.chain().focus().unsetMark('textStyle').run()
            e.target.value = ''
          }}
          defaultValue=""
        >
          <option value="">Size</option>
          <option value="12px">Small</option>
          <option value="14px">Normal</option>
          <option value="18px">Large</option>
          <option value="24px">X-Large</option>
        </select>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
