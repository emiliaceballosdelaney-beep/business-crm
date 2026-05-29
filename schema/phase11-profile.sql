-- Phase 11: User profile table for avatar + future profile fields
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS profile (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (startup_id)
);

-- Seed one row for Prosper (replace value with PROSPER_STARTUP_ID from lib/constants.ts if needed)
INSERT INTO profile (startup_id)
VALUES ('37bba3f8-b055-4312-8137-6850f63c64b4')
ON CONFLICT (startup_id) DO NOTHING;
