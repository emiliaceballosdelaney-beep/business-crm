-- Minimal Phase 2 additions — run in Supabase SQL Editor
-- Fixes: clients.last_contacted_at, meetings.client_id FK, interactions table

-- 1. Add last_contacted_at to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- 2. Extend meetings with client FK + supporting columns the app queries
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS client_id       UUID REFERENCES public.clients(id),
  ADD COLUMN IF NOT EXISTS meeting_type    TEXT DEFAULT 'session',
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS status          TEXT DEFAULT 'scheduled';

CREATE INDEX IF NOT EXISTS meetings_client_id_idx ON public.meetings(client_id);

-- 3. Create interactions table (client activity timeline)
CREATE TABLE IF NOT EXISTS public.interactions (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id       UUID        NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  client_id        UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  interaction_type TEXT        NOT NULL,
  title            TEXT        NOT NULL,
  body             TEXT,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount_cents     INTEGER,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'interactions' AND policyname = 'Allow all on interactions'
  ) THEN
    CREATE POLICY "Allow all on interactions"
      ON public.interactions FOR ALL USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS interactions_client_id_occurred
  ON public.interactions(client_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS interactions_startup_id_idx
  ON public.interactions(startup_id);
