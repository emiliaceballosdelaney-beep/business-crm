'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  Target,
  FolderOpen,
  CheckSquare,
  Settings,
  ChevronDown,
  Kanban,
  Mail,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',       label: 'Home',       icon: Home },
  { href: '/clients',    label: 'Clients',    icon: Users },
  { href: '/pipeline',   label: 'Pipeline',   icon: Kanban },
  { href: '/meetings',   label: 'Meetings',   icon: Calendar },
  { href: '/emails',     label: 'Emails',     icon: Mail },
  { href: '/milestones', label: 'Milestones', icon: Target },
  { href: '/projects',   label: 'Projects',   icon: FolderOpen },
  { href: '/tasks',      label: 'Tasks',      icon: CheckSquare },
]

export default function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (!pathname) return false
    if (href === '/home') return pathname === '/home'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-muted)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        paddingTop: 24,
        paddingBottom: 24,
      }}
    >
      {/* Header: business name */}
      <div style={{ marginBottom: 40, paddingLeft: 16, paddingRight: 8 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>
            Prosper with Em
          </span>
          <ChevronDown size={14} color="rgba(255,255,255,0.7)" strokeWidth={2} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', padding: '0 8px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return active ? (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 24px',
                borderRadius: 0,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                position: 'relative',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.05em',
                margin: '0 -8px',
                width: 'calc(100% + 16px)',
              }}
            >
              {/* 4px left indicator */}
              <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 4, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '0 2px 2px 0' }} />
              <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.05em',
                transition: 'background 0.1s ease, color 0.1s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,179,180,0.1)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div style={{ borderTop: '1px solid var(--sidebar-muted)', paddingTop: 8, padding: '8px 8px 0' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 16px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,179,180,0.1)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
        >
          <Settings size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
