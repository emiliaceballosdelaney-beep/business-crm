-- Add completed_at to tasks table
-- Existing completed tasks will show NULL (completion date unknown before this migration)
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
