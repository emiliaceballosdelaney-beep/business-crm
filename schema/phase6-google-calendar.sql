-- Phase 6 — Google Calendar two-way sync
-- Run in Supabase SQL Editor after obtaining Google OAuth credentials.

-- 1. Track which meetings are linked to a Google Calendar event
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS google_event_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS meetings_google_event_id_idx ON public.meetings(google_event_id);

-- 2. Store OAuth tokens per startup (one row per startup)
CREATE TABLE IF NOT EXISTS public.google_tokens (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id    UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry  TIMESTAMPTZ,
  calendar_id   TEXT NOT NULL DEFAULT 'primary',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(startup_id)
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_google_tokens" ON public.google_tokens FOR ALL USING (true);
