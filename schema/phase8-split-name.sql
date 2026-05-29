-- Split clients.name into first_name + last_name.
-- Keep name in sync so embedded queries (meetings, tasks) continue to work.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name  text NOT NULL DEFAULT '';

-- Backfill: everything before the first space → first_name, rest → last_name
UPDATE public.clients
SET
  first_name = CASE
    WHEN position(' ' IN name) > 0 THEN substring(name FROM 1 FOR position(' ' IN name) - 1)
    ELSE name
  END,
  last_name = CASE
    WHEN position(' ' IN name) > 0 THEN trim(substring(name FROM position(' ' IN name) + 1))
    ELSE ''
  END
WHERE first_name = '' AND name IS NOT NULL;
