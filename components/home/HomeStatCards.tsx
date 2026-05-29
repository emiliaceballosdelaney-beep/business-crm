import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import { PIPELINE_STAGES } from '@/lib/constants'

interface Props {
  stageCounts: Record<string, number>
  newLeads: number
  newLeadsThisWeek: number
  newLeadsThisMonth: number
  newLeadsLastMonth: number
  tasksCompleted: number
  tasksOpen: number
  projectStats: { active: number; on_hold: number; complete: number }
  milestonesComplete: number
  milestonesInProgress: number
  milestonesTotal: number
}

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: 140,
}

const labelStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 11,
  color: '#574141',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: 8,
}

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  padding: '0 4px',
}

const numStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  color: '#640015',
  textAlign: 'right',
  fontSize: 14,
}

function StatCard({ label, heroContent, children, href }: { label: string; heroContent: ReactNode; children?: ReactNode; href?: string }) {
  const inner = (
    <div style={{ ...cardStyle, ...(href ? { cursor: 'pointer', transition: 'box-shadow 0.15s ease' } : {}) }}>
      <span style={labelStyle}>{label}</span>
      {/* Fixed-height hero — keeps divider at identical position on every card */}
      <div style={{ height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {heroContent}
      </div>
      {children && (
        <div style={{ borderTop: '1px solid rgba(222,191,191,0.4)', paddingTop: 10, paddingBottom: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  )
  if (href) {
    return (
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }} className="hover:shadow-md rounded-xl transition-shadow">
        {inner}
      </Link>
    )
  }
  return inner
}

function PlainHero({ number, sub }: { number: ReactNode; sub: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 52, fontWeight: 700, color: '#640015', lineHeight: 1 }}>{number}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9c9490', marginTop: 4 }}>{sub}</span>
    </div>
  )
}

function StatusDot({ color }: { color: string }) {
  return <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
}

function RingHero({ count, total, sub }: { count: number; total: number; sub?: string }) {
  const r = 40
  const size = 96
  const circumference = 2 * Math.PI * r
  const offset = total > 0 ? circumference * (1 - count / total) : circumference
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-8px)' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fecdd3" strokeWidth={7} />
        {total > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#640015" strokeWidth={7}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        )}
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: '#640015', lineHeight: 1 }}>{count}</span>
        {sub && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#9c9490', lineHeight: 1 }}>{sub}</span>}
      </div>
    </div>
  )
}

function TotalRow({ total }: { total: number }) {
  return (
    <div style={{ borderTop: '1px solid rgba(222,191,191,0.3)', marginTop: 'auto', padding: '8px 4px 0', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: '#640015', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>TOTAL</span>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#640015', textAlign: 'right' as const }}>{total}</span>
    </div>
  )
}

function BodyRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={rowStyle}>
      <span style={{ fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#1b1c1c' }}>{label}</span>
      <span style={numStyle}>{value}</span>
    </div>
  )
}

function DonutRing({ done, total }: { done: number; total: number }) {
  const r = 28
  const circumference = 2 * Math.PI * r
  const offset = total > 0 ? circumference * (1 - done / total) : circumference
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={64} height={64} viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={32} cy={32} r={r} fill="none" stroke="#fecdd3" strokeWidth={6} />
          {total > 0 && (
            <circle cx={32} cy={32} r={r} fill="none" stroke="#640015" strokeWidth={6}
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
          )}
        </svg>
        <span style={{ position: 'absolute', fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: '#640015' }}>{done}</span>
      </div>
    </div>
  )
}

function SmallRing({ done, total, label }: { done: number; total: number; label: string }) {
  const r = 20
  const circumference = 2 * Math.PI * r
  const offset = total > 0 ? circumference * (1 - done / total) : circumference
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 4, paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={26} cy={26} r={r} fill="none" stroke="#fecdd3" strokeWidth={5} />
          {total > 0 && (
            <circle cx={26} cy={26} r={r} fill="none" stroke="#640015" strokeWidth={5}
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
          )}
        </svg>
        <span style={{ position: 'absolute', fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: '#640015' }}>{done}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#9c9490', textAlign: 'center' as const }}>{label}</span>
    </div>
  )
}

function MilestoneSteps({ complete, total }: { complete: number; total: number }) {
  const count = Math.min(Math.max(total, 1), 5)
  const steps = Array.from({ length: count }, (_, i) => {
    if (i < complete) return 'done'
    if (i === complete) return 'current'
    return 'upcoming'
  })

  const lineColor = (i: number) => steps[i + 1] === 'done' ? '#640015' : '#fecdd3'

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 8px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {steps.map((state, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < count - 1 ? 1 : 0 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: state === 'done' ? '#640015' : 'transparent',
              border: state === 'done' ? 'none' : `1px solid ${state === 'current' ? '#640015' : '#fecdd3'}`,
            }}>
              {state === 'done' && <span style={{ color: 'white', fontSize: 10, lineHeight: 1 }}>✓</span>}
              {state === 'current' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#640015' }} />}
            </div>
            {i < count - 1 && (
              <div style={{ height: 1, flex: 1, margin: '0 2px', backgroundColor: lineColor(i) }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeStatCards({
  stageCounts, newLeads, newLeadsThisMonth, newLeadsLastMonth,
  tasksCompleted, tasksOpen, projectStats, milestonesComplete, milestonesInProgress, milestonesTotal,
}: Props) {
  const totalClients = Object.values(stageCounts).reduce((a, b) => a + b, 0)
  const totalProjects = projectStats.active + projectStats.on_hold + projectStats.complete
  const totalTasks = tasksCompleted + tasksOpen

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 40, marginTop: 24 }}>

      {/* Card 1 — Clients */}
      <StatCard label="CLIENTS" href="/clients" heroContent={<PlainHero number={stageCounts['active'] ?? 0} sub="active clients" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...PIPELINE_STAGES]
            .filter(({ value }) => value !== 'active' && (stageCounts[value] ?? 0) > 0)
            .sort((a, b) => (a.value === 'discovery' ? -1 : b.value === 'discovery' ? 1 : 0))
            .map(({ value, label }) => (
              <div key={value} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 4px' }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>{label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{stageCounts[value]}</span>
              </div>
            ))}
        </div>
      </StatCard>

      {/* Card 2 — Leads */}
      {(() => {
        const delta = newLeadsThisMonth - newLeadsLastMonth
        const trending = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
        const trendColor = trending === 'up' ? '#4d7c0f' : trending === 'down' ? '#b91c1c' : '#9c9490'
        const trendText = trending === 'flat' ? 'same as last month' : `${Math.abs(delta)} ${trending === 'up' ? 'more' : 'fewer'} than last month`
        return (
          <StatCard label="LEADS" href="/pipeline" heroContent={<PlainHero number={newLeadsThisMonth} sub="this month" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 4px' }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>Last month</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{newLeadsLastMonth}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
                {trending === 'up' && <ArrowUp size={11} color={trendColor} strokeWidth={2.5} />}
                {trending === 'down' && <ArrowUp size={11} color={trendColor} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} />}
                <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 600, color: trendColor }}>{trendText}</span>
              </div>
            </div>
          </StatCard>
        )
      })()}

      {/* Card 3 — Tasks */}
      <StatCard label="TASKS" href="/tasks" heroContent={<RingHero count={tasksOpen} total={totalTasks} sub="open" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <StatusDot color="#6b90c6" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>Open</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{tasksOpen}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <StatusDot color="#8aba2f" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>Complete</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{tasksCompleted}</span>
          </div>
        </div>
      </StatCard>

      {/* Card 4 — Projects */}
      <StatCard label="PROJECTS" href="/projects" heroContent={<PlainHero number={projectStats.active} sub="active projects" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <StatusDot color="#f59e0b" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>On Hold</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{projectStats.on_hold}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <StatusDot color="#8aba2f" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>Complete</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{projectStats.complete}</span>
          </div>
        </div>
      </StatCard>

      {/* Card 5 — Milestones */}
      <StatCard label="MILESTONES" href="/milestones" heroContent={<RingHero count={milestonesInProgress} total={milestonesTotal} sub="in progress" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <StatusDot color="#a1a1aa" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>Upcoming</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{milestonesTotal - milestonesComplete - milestonesInProgress}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <StatusDot color="#8aba2f" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: '#574141' }}>Complete</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#640015' }}>{milestonesComplete}</span>
          </div>
        </div>
      </StatCard>

    </div>
  )
}
