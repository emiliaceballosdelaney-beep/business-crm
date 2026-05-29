'use client'
import SendAsDropdown from './SendAsDropdown'
import RichTextEditor from './RichTextEditor'
import SignatureEditor from './SignatureEditor'

interface Props {
  from:            string
  to:              string
  subject:         string
  body:            string
  sigText:         string
  onFromChange:    (v: string) => void
  onToChange:      (v: string) => void
  onSubjectChange: (v: string) => void
  onBodyChange:    (v: string) => void
  onSigSave:       (t: string) => void
  disabled?:       boolean
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: '#9c9490', marginBottom: 4, display: 'block',
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #debfbf', borderRadius: 8, padding: '8px 12px',
  fontFamily: 'var(--font-body)', fontSize: 14, color: '#1b1c1c',
  width: '100%', boxSizing: 'border-box', outline: 'none',
}

export default function ComposeForm({
  from, to, subject, body, sigText,
  onFromChange, onToChange, onSubjectChange, onBodyChange, onSigSave,
  disabled,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>From</label>
        <SendAsDropdown value={from} onChange={onFromChange} disabled={disabled} />
      </div>
      <div>
        <label style={labelStyle}>To</label>
        <input
          type="email"
          value={to}
          onChange={e => onToChange(e.target.value)}
          placeholder="recipient@example.com"
          disabled={disabled}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={e => onSubjectChange(e.target.value)}
          placeholder="Subject"
          disabled={disabled}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Body</label>
        <RichTextEditor content={body} onChange={onBodyChange} disabled={disabled} minHeight={240} />
        <SignatureEditor text={sigText} onSave={onSigSave} />
      </div>
    </div>
  )
}
