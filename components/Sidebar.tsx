import { useRouter } from 'next/router'

const navItems = [
  { label: 'Overview', icon: '⬡', href: '/' },
  { label: 'Tasks', icon: '◻', href: '/tasks' },
  { label: 'Milestones', icon: '◈', href: '/milestones' },
  { label: 'Clients', icon: '◉', href: '/clients' },
  { label: 'Meetings', icon: '◷', href: '/meetings' },
  { label: 'Notes', icon: '◫', href: '/notes' },
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Em's Dashboard
        <span>Startup Tracker</span>
      </div>

      {navItems.map((item) => (
        <button
          key={item.href}
          className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
          onClick={() => router.push(item.href)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </aside>
  )
}
