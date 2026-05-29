import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Startup {
  id: string
  name: string
  stage: string
  one_liner: string | null
  description: string | null
  goals: string | null
  website: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  startup_id: string
  name: string
  first_name: string
  last_name: string
  email: string | null
  status: string | null
  notes: string | null
  created_at: string
  // Phase 2 CRM fields
  phone: string | null
  client_type: 'client' | 'lead' | null
  billing_model: 'package' | 'per_session' | null
  package_type: string | null
  package_price_cents: number | null
  sessions_total: number | null
  sessions_used: number
  package_start_date: string | null
  package_expiry_date: string | null
  referred_by: string | null
  last_contacted_at: string | null
  follow_up_due_at: string | null
  stripe_customer_id: string | null
  calendly_uri: string | null
  lead_stage: string | null
  // Consulting-only
  business_type: string | null
  tools_used: string[] | null
  pain_points: string | null
  estimated_deal_cents: number | null
  outreach_count: number
  outreach_channel: string | null
  // Prosper-only
  financial_stage: string | null
}

export interface Task {
  id: string
  startup_id: string
  client_id: string | null
  title: string
  description: string | null
  status: string
  priority: string | null
  due_date: string | null
  created_at: string
}

export interface Meeting {
  id: string
  startup_id: string
  client_id: string | null
  title: string
  date: string
  notes: string | null
  attendees: string[] | null
  created_at: string
  meeting_type: string | null
  duration_minutes: number | null
  calendly_event_uri: string | null
  status: string | null
}

export interface Note {
  id: string
  startup_id: string
  client_id: string | null
  content: string
  tags: string[] | null
  created_at: string
}

export interface Milestone {
  id: string
  startup_id: string
  title: string
  description: string | null
  target_date: string | null
  completed_at: string | null
  status: string
  created_at: string
}

export interface Interaction {
  id: string
  startup_id: string
  client_id: string | null
  interaction_type: string
  title: string
  body: string | null
  occurred_at: string
  amount_cents: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Proposal {
  id: string
  startup_id: string
  client_id: string | null
  title: string
  amount_cents: number | null
  status: string
  sent_at: string | null
  scope: string | null
  deliverables: string | null
  timeline_weeks: number | null
  labor_hours_saved_weekly: number | null
  notes: string | null
  created_at: string
}

export interface FollowUp {
  id: string
  client_id: string
  startup_id: string
  due_at: string
  reason: string | null
  status: string
  snoozed_until: string | null
  created_at: string
}

// With client join
export interface FollowUpWithClient extends FollowUp {
  client: Pick<Client, 'id' | 'name' | 'email' | 'startup_id' | 'lead_stage' | 'last_contacted_at'>
}
