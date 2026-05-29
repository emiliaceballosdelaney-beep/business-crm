// Startup IDs — seeded 2026-04-23, confirmed via MCP list_startups
export const PROSPER_STARTUP_ID = '37bba3f8-b055-4312-8137-6850f63c64b4'

// ─── Pipeline stages ────────────────────────────────────────
export const PIPELINE_STAGES = [
  { value: 'lead',      label: 'Lead',      description: 'Potential client, not yet in conversation' },
  { value: 'discovery', label: 'Discovery', description: 'On discovery call or actively discussing' },
  { value: 'active',    label: 'Active',    description: 'Currently in a package or ongoing support' },
  { value: 'paused',    label: 'Paused',    description: 'Taking a break' },
  { value: 'cold',      label: 'Cold',      description: 'No longer engaging' },
] as const

export type PipelineStage = typeof PIPELINE_STAGES[number]['value']

// ─── Service types (pills on Active client cards) ────────────
export const PACKAGES = [
  { value: 'focus',          label: 'Focus' },
  { value: 'clarity',        label: 'Clarity' },
  { value: 'growth',         label: 'Growth' },
  { value: 'transformation', label: 'Transformation' },
] as const

export const ONGOING_SUPPORT = [
  { value: 'steady',    label: 'Steady' },
  { value: 'supported', label: 'Supported' },
  { value: 'committed', label: 'Committed' },
] as const

export const SERVICE_TYPES = [...PACKAGES, ...ONGOING_SUPPORT] as const
export type ServiceType = typeof SERVICE_TYPES[number]['value']

// ─── Status enums ────────────────────────────────────────────
export const TASK_STATUSES = [
  { value: 'pending',   label: 'Pending' },
  { value: 'on_hold',   label: 'On Hold' },
  { value: 'completed', label: 'Complete' },
  { value: 'abandoned', label: 'Abandoned' },
] as const

export type TaskStatus = typeof TASK_STATUSES[number]['value']

export const MILESTONE_STATUSES = [
  { value: 'upcoming',    label: 'Upcoming' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'achieved',    label: 'Complete' },
] as const

export type MilestoneStatus = typeof MILESTONE_STATUSES[number]['value']

export const PROJECT_STATUSES = [
  { value: 'active',   label: 'Active' },
  { value: 'on_hold',  label: 'On Hold' },
  { value: 'complete', label: 'Complete' },
] as const

export type ProjectStatus = typeof PROJECT_STATUSES[number]['value']

// ─── Packages ─────────────────────────────────────────────────
export const PACKAGE_DEFINITIONS = {
  clarity: {
    label: 'Clarity',
    price: 59900,
    sessions: 3,
    expiry_months: 6,
    description: '1×90min + 2×60min',
  },
  confidence: {
    label: 'Confidence',
    price: 109900,
    sessions: 6,
    expiry_months: 12,
    description: '1×90min + 5×60min',
  },
  targeted: {
    label: 'Targeted',
    price: 19900,
    sessions: 1,
    expiry_months: 1,
    description: '1×60min',
  },
  maintenance_90: {
    label: 'Maintenance 90m',
    price: 19900,
    sessions: null,
    expiry_months: null,
    description: 'Monthly, cancel anytime',
  },
  maintenance_60: {
    label: 'Maintenance 60m',
    price: 14900,
    sessions: null,
    expiry_months: null,
    description: 'Monthly, cancel anytime',
  },
  maintenance_30: {
    label: 'Maintenance 30m',
    price: 9900,
    sessions: null,
    expiry_months: null,
    description: 'Monthly, cancel anytime',
  },
} as const

// ─── Client source options ────────────────────────────────────
export const SOURCE_OPTIONS = [
  'Instagram', 'Referral', 'Word of Mouth', 'Website',
  'Podcast', 'Newsletter', 'Other',
] as const

// ─── Income source options ────────────────────────────────────
export const INCOME_SOURCE_OPTIONS = [
  'W2 Employee', 'Freelance', 'Contractor', 'Self-Employed',
  'Business Owner', 'Disability', 'Retirement / Pension',
  'Social Security', 'Investment Income', 'Rental Income',
  'Part-Time', 'Multiple Sources', 'Other',
] as const

// ─── Interaction types ────────────────────────────────────────
// Form-selectable types (direct contact + notes)
export const INTERACTION_TYPES = [
  { value: 'call',    label: 'Phone Call' },
  { value: 'email',   label: 'Email' },
  { value: 'text',    label: 'Text / SMS' },
  { value: 'session', label: 'Coaching Session' },
  { value: 'note',    label: 'Note' },
] as const

// Types that count as direct client contact — update last_contacted_at
export const DIRECT_CONTACT_TYPES = ['call', 'email', 'text', 'session', 'discovery'] as const

// Display labels for all interaction types (including system-generated)
export const INTERACTION_TYPE_LABELS: Record<string, string> = {
  call:               'Phone Call',
  email:              'Email',
  text:               'Text / SMS',
  session:            'Client Session',
  discovery:          'Client Discovery Call',
  note:               'Note',
  meeting_scheduled:  'Meeting Scheduled',
  stripe_payment:     'Payment',
  calendly_booking:   'Booking',
}

// ─── Meeting types ────────────────────────────────────────────
export type MeetingTypeConfig = {
  abbrev: string; label: string
  avatarBg: string; avatarColor: string
  badgeBg: string; badgeColor: string
}

export const MEETING_TYPE_CONFIG: Record<string, MeetingTypeConfig> = {
  session:   { abbrev: 'CS', label: 'Client Session',        avatarBg: '#640015', avatarColor: '#F7F1ED', badgeBg: 'rgba(100,0,21,0.08)',    badgeColor: '#640015' },
  discovery: { abbrev: 'DC', label: 'Client Discovery Call', avatarBg: '#AB655C', avatarColor: '#F7F1ED', badgeBg: 'rgba(171,101,92,0.12)', badgeColor: '#8d4c44' },
  internal:  { abbrev: 'BM', label: 'Business Meeting',      avatarBg: '#3d0009', avatarColor: '#debfbf', badgeBg: 'rgba(61,0,9,0.08)',      badgeColor: '#3d0009' },
  personal:  { abbrev: 'PS', label: 'Personal',              avatarBg: '#fecdd3', avatarColor: '#640015', badgeBg: 'rgba(254,205,211,0.5)', badgeColor: '#8d4c44' },
}

const DEFAULT_MEETING_TYPE: MeetingTypeConfig = {
  abbrev: '--', label: 'Meeting', avatarBg: '#574141', avatarColor: '#F7F1ED', badgeBg: 'rgba(87,65,65,0.1)', badgeColor: '#574141',
}

export function getMeetingTypeConfig(type: string | null): MeetingTypeConfig {
  return (type && MEETING_TYPE_CONFIG[type]) ? MEETING_TYPE_CONFIG[type] : DEFAULT_MEETING_TYPE
}

// ─── Finance tools (tag pills on Client Detail) ───────────────
export const FINANCE_TOOL_CATEGORIES: Record<string, string[]> = {
  Banking:        ['Ally', 'Bank of America', 'Capital One', 'Chase', 'Chime', 'Citi', 'Marcus', 'SoFi', 'US Bank', 'Wells Fargo'],
  Budgeting:      ['Copilot', 'EveryDollar', 'Mint', 'Monarch', 'Tiller', 'YNAB'],
  'Credit Cards': ['Amex', 'Apple Card', 'Bilt', 'Discover', 'Venture X'],
  Investing:      ['Acorns', 'Betterment', 'Coinbase', 'Fidelity', 'M1 Finance', 'Robinhood', 'Schwab', 'Stash', 'Vanguard', 'Wealthfront'],
  Loans:          ['Credible', 'Earnest', 'MOHELA', 'Navient', 'Nelnet', 'SoFi Loans'],
  Other:          ['Credit Karma', 'Empower', 'NerdWallet', 'Personal Capital'],
}

export const FINANCE_TOOLS = Object.values(FINANCE_TOOL_CATEGORIES).flat()

// ─── Priority colors (shared across all task rows) ────────────
export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  urgent: { bg: '#FCA5A5', text: '#7F1D1D' },
  high:   { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low:    { bg: '#F0EEEC', text: '#6B6360' },
}

// ─── Status styles (single source of truth for all status pills) ────────────
export const MILESTONE_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  in_progress: { bg: '#e4eefa', text: '#3a62a8', label: 'In Progress' },
  achieved:    { bg: '#ecfccb', text: '#3f6212', label: 'Complete' },
  upcoming:    { bg: '#f4f4f5', text: '#52525b', label: 'Upcoming' },
}

export const PROJECT_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active:   { bg: '#e4eefa', text: '#3a62a8', label: 'Active' },
  on_hold:  { bg: '#fef3c7', text: '#92400e', label: 'On Hold' },
  complete: { bg: '#ecfccb', text: '#3f6212', label: 'Complete' },
}

export const TASK_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#f4f4f5', text: '#52525b', label: 'Pending' },
  on_hold:   { bg: '#fef3c7', text: '#92400e', label: 'On Hold' },
  completed: { bg: '#ecfccb', text: '#3f6212', label: 'Complete' },
  abandoned: { bg: '#fee2e2', text: '#991b1b', label: 'Abandoned' },
}

export const CLIENT_STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  lead:      { bg: '#f4f4f5', text: '#52525b' },
  discovery: { bg: '#e4eefa', text: '#3a62a8' },
  active:    { bg: '#ecfccb', text: '#3f6212' },
  paused:    { bg: '#fef3c7', text: '#92400e' },
  cold:      { bg: '#e4e4e7', text: '#71717a' },
}
