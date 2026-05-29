'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Phone, Mail, MessageSquare, Users, FileText, CalendarPlus, CreditCard, Calendar } from 'lucide-react'
import type { InteractionRow } from './types'
import InteractionForm from '@/components/forms/InteractionForm'
import { INTERACTION_TYPE_LABELS } from '@/lib/constants'

type IconComp = React.ComponentType<{ size?: number; color?: string }>

const TYPE_CONFIG: Record<string, { icon: IconComp; iconColor: string; iconBg: string; badgeBg: string; badgeColor: string }> = {
  call:             { icon: Phone,         iconColor: '#640015', iconBg: '#F5E8EA', badgeBg: '#F5E8EA', badgeColor: '#640015' },
  email:            { icon: Mail,          iconColor: '#640015', iconBg: '#F5E8EA', badgeBg: '#F5E8EA', badgeColor: '#640015' },
  text:             { icon: MessageSquare, iconColor: '#640015', iconBg: '#F5E8EA', badgeBg: '#F5E8EA', badgeColor: '#640015' },
  session:          { icon: Users,         iconColor: '#640015', iconBg: '#F5E8EA', badgeBg: '#F5E8EA', badgeColor: '#640015' },
  discovery:        { icon: Phone,         iconColor: '#640015', iconBg: '#F5E8EA', badgeBg: '#F5E8EA', badgeColor: '#640015' },
  note:             { icon: FileText,      iconColor: '#574141', iconBg: '#F0EFEE', badgeBg: '#F0EFEE', badgeColor: '#574141' },
  meeting_scheduled:{ icon: CalendarPlus,  iconColor: '#574141', iconBg: '#F0EFEE', badgeBg: '#F0EFEE', badgeColor: '#574141' },
  stripe_payment:   { icon: CreditCard,    iconColor: '#1a5c2e', iconBg: '#e8f5ee', badgeBg: '#e8f5ee', badgeColor: '#1a5c2e' },
  calendly_booking: { icon: Calendar,      iconColor: '#574141', iconBg: '#F0EFEE', badgeBg: '#F0EFEE', badgeColor: '#574141' },
}

const DEFAULT_CONFIG: typeof TYPE_CONFIG[string] = {
  icon: FileText, iconColor: '#574141', iconBg: '#F0EFEE', badgeBg: '#F0EFEE', badgeColor: '#574141',
}

export default function ActivityTab({ interactions, clientId }: { interactions: InteractionRow[]; clientId: string }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <InteractionForm isOpen={showForm} onClose={() => setShowForm(false)} clientId={clientId} />

      {interactions.length === 0 ? (
        <div style={{ border: '2px dashed rgba(222,191,191,0.5)', borderRadius: 8, padding: '40px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontStyle: 'italic', color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0 }}>No activity logged yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {interactions.map((item, i) => {
            const cfg = TYPE_CONFIG[item.interaction_type] ?? DEFAULT_CONFIG
            const Icon = cfg.icon
            const date = new Date(item.occurred_at)

            return (
              <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0, paddingTop: 13 }}>
                  <span style={{ fontSize: 11, color: '#9c9490', fontFamily: 'var(--font-body)', fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {format(date, 'MMM d')}
                  </span>
                  {i < interactions.length - 1 && (
                    <div style={{ width: 1, flexGrow: 1, minHeight: 24, backgroundColor: '#debfbf', opacity: 0.5, marginTop: 8 }} />
                  )}
                </div>

                {/* Card */}
                <div style={{ paddingBottom: 14, flex: 1 }}>
                  <div style={{ backgroundColor: 'white', border: '1px solid #E8E0DC', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Icon circle */}
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: cfg.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Icon size={15} color={cfg.iconColor} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                        <span style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor, fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                          {INTERACTION_TYPE_LABELS[item.interaction_type] ?? item.interaction_type}
                        </span>
                        <span style={{ fontSize: 11, color: '#9c9490', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {format(date, 'h:mm a')}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: '#1b1c1c', margin: '0 0 3px 0', fontWeight: 500, lineHeight: 1.4 }}>
                        {item.title}
                      </p>
                      {item.body && (
                        <p style={{ fontSize: 13, color: '#9c9490', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
                          {item.body}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
