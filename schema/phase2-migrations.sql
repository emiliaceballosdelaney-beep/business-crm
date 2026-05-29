-- Phase 2 CRM Migrations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qjotzepgeaibulbvtbjs/sql

-- ============================================================
-- 1. EXTEND clients table
-- ============================================================
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'client',
  -- 'client' | 'lead'
  ADD COLUMN IF NOT EXISTS billing_model TEXT DEFAULT 'package',
  -- 'package' | 'per_session'
  ADD COLUMN IF NOT EXISTS package_type TEXT,
  -- 'clarity' | 'confidence' | 'targeted' | 'maintenance_90' | 'maintenance_60' | 'maintenance_30'
  ADD COLUMN IF NOT EXISTS package_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS sessions_total INTEGER,
  ADD COLUMN IF NOT EXISTS sessions_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS package_start_date DATE,
  ADD COLUMN IF NOT EXISTS package_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.clients(id),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS follow_up_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS calendly_uri TEXT,
  ADD COLUMN IF NOT EXISTS lead_stage TEXT DEFAULT 'prospect',
  -- 'prospect' | 'audit' | 'proposal_sent' | 'active' | 'closed_won' | 'closed_lost'
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  -- consulting: 'restaurant' | 'event_venue' | 'hotel' | 'catering' | 'other'
  ADD COLUMN IF NOT EXISTS tools_used TEXT[],
  -- consulting: e.g. ['Toast', 'TripleSeat', 'MarginEdge']
  ADD COLUMN IF NOT EXISTS pain_points TEXT,
  ADD COLUMN IF NOT EXISTS estimated_deal_cents INTEGER,
  ADD COLUMN IF NOT EXISTS outreach_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outreach_channel TEXT,
  -- 'linkedin' | 'email' | 'phone' | 'in_person'
  ADD COLUMN IF NOT EXISTS financial_stage TEXT;
  -- prosper: 'emergency_fund' | 'debt_payoff' | 'investing' | 'goals'

-- ============================================================
-- 2. EXTEND meetings table
-- ============================================================
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
  ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'session',
  -- 'discovery' | 'session' | 'audit' | 'internal'
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS calendly_event_uri TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
  -- 'scheduled' | 'completed' | 'cancelled'

-- ============================================================
-- 3. EXTEND tasks table
-- ============================================================
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);

-- ============================================================
-- 4. CREATE interactions table (client timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL,
  -- 'call' | 'email' | 'session' | 'note' | 'stripe_payment' | 'calendly_booking' | 'linkedin_message' | 'outreach'
  title TEXT NOT NULL,
  body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount_cents INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS interactions_client_id_occurred
  ON public.interactions(client_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS interactions_startup_id_idx
  ON public.interactions(startup_id);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'interactions' AND policyname = 'Allow all on interactions'
  ) THEN
    CREATE POLICY "Allow all on interactions" ON public.interactions FOR ALL USING (true);
  END IF;
END $$;

-- ============================================================
-- 5. CREATE proposals table (consulting only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  -- 'draft' | 'sent' | 'accepted' | 'declined'
  sent_at TIMESTAMPTZ,
  scope TEXT,
  deliverables TEXT,
  timeline_weeks INTEGER,
  labor_hours_saved_weekly INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS proposals_client_id_idx ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS proposals_startup_id_idx ON public.proposals(startup_id);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Allow all on proposals'
  ) THEN
    CREATE POLICY "Allow all on proposals" ON public.proposals FOR ALL USING (true);
  END IF;
END $$;

-- ============================================================
-- 6. CREATE follow_ups table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  -- 'no_contact' | 'package_expiring' | 'outreach_followup' | 'manual' | 'post_session'
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'done' | 'snoozed'
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS follow_ups_due_at_idx
  ON public.follow_ups(due_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS follow_ups_client_id_idx ON public.follow_ups(client_id);

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follow_ups' AND policyname = 'Allow all on follow_ups'
  ) THEN
    CREATE POLICY "Allow all on follow_ups" ON public.follow_ups FOR ALL USING (true);
  END IF;
END $$;
