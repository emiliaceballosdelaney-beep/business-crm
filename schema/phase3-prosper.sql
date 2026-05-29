-- Phase 3 — Prosper with Em CRM Migration
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/qjotzepgeaibulbvtbjs/sql
--
-- Real schema at time of writing:
--   clients: id, user_id, startup_id, name, email, phone, company, type,
--            status ('prospect'|'active'), source, notes, tags,
--            last_contacted, follow_up_date, created_at, updated_at
--   tasks:   id, startup_id, title, description, status ('pending'), priority, due_date, created_at
--   milestones: id, startup_id, title, description, target_date, completed_at,
--               status ('pending'), created_at
--   NO projects table

-- ============================================================
-- 1. EXTEND clients — contact fields
-- ============================================================
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS birthday   DATE,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS location   TEXT,
  ADD COLUMN IF NOT EXISTS source     TEXT;  -- already exists; IF NOT EXISTS is a no-op

-- ============================================================
-- 2. EXTEND clients — financial detail fields
-- ============================================================
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS income_range  TEXT,
  ADD COLUMN IF NOT EXISTS income_source TEXT,
  ADD COLUMN IF NOT EXISTS savings       TEXT,
  ADD COLUMN IF NOT EXISTS investments   TEXT,
  ADD COLUMN IF NOT EXISTS debt_notes    TEXT,
  ADD COLUMN IF NOT EXISTS finance_tools TEXT[],
  ADD COLUMN IF NOT EXISTS goals         JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS challenges    TEXT;

-- ============================================================
-- 3. ADD clients.lead_stage — new column, migrate from status
-- ============================================================
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS lead_stage TEXT;

-- Populate from existing status values
UPDATE public.clients SET lead_stage = 'active'    WHERE status = 'active';
UPDATE public.clients SET lead_stage = 'discovery' WHERE status IN ('audit', 'proposal_sent');
UPDATE public.clients SET lead_stage = 'cold'      WHERE status IN ('closed_won', 'closed_lost', 'churned');
-- prospect + anything else → lead
UPDATE public.clients SET lead_stage = 'lead' WHERE lead_stage IS NULL;

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_lead_stage_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_lead_stage_check
  CHECK (lead_stage IN ('lead', 'discovery', 'active', 'paused', 'cold'));

-- ============================================================
-- 4. UPDATE tasks.status + add client_id FK
-- ============================================================
-- Normalise any legacy spellings before locking the constraint
UPDATE public.tasks SET status = 'completed' WHERE status = 'complete';
UPDATE public.tasks SET status = 'pending'
  WHERE status NOT IN ('pending', 'on_hold', 'completed', 'abandoned');

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('pending', 'on_hold', 'completed', 'abandoned'));

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_client_id_idx ON public.tasks(client_id);

-- ============================================================
-- 5. UPDATE milestones.status — migrate data + add CHECK
-- ============================================================
UPDATE public.milestones SET status = 'achieved' WHERE status IN ('complete', 'completed');
-- pending + anything non-standard → upcoming
UPDATE public.milestones SET status = 'upcoming'
  WHERE status NOT IN ('in_progress', 'upcoming', 'achieved');

ALTER TABLE public.milestones DROP CONSTRAINT IF EXISTS milestones_status_check;
ALTER TABLE public.milestones ADD CONSTRAINT milestones_status_check
  CHECK (status IN ('in_progress', 'upcoming', 'achieved'));

-- ============================================================
-- 6. CREATE projects table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id   UUID        NOT NULL REFERENCES public.startups(id)   ON DELETE CASCADE,
  client_id    UUID                 REFERENCES public.clients(id)    ON DELETE SET NULL,
  milestone_id UUID                 REFERENCES public.milestones(id) ON DELETE SET NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  status       TEXT        NOT NULL DEFAULT 'active',
  due_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_status_check CHECK (status IN ('active', 'on_hold', 'complete'))
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Allow all on projects'
  ) THEN
    CREATE POLICY "Allow all on projects" ON public.projects FOR ALL USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS projects_startup_id_idx   ON public.projects(startup_id);
CREATE INDEX IF NOT EXISTS projects_client_id_idx    ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS projects_milestone_id_idx ON public.projects(milestone_id);
CREATE INDEX IF NOT EXISTS projects_status_idx       ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_due_date_idx     ON public.projects(due_date);

-- ============================================================
-- 7. EXTEND tasks — add project_id and milestone_id FKs
-- ============================================================
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS project_id   UUID REFERENCES public.projects(id)   ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_project_id_idx   ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_milestone_id_idx ON public.tasks(milestone_id);
