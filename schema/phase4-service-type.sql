-- Phase 4 — Add service_type to clients
-- Run in Supabase SQL Editor when ready to populate service type pills on Active client cards.
-- After applying, set service_type on existing clients manually or via the Edit Client form.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS service_type TEXT
  CHECK (service_type IN (
    'focus', 'clarity', 'growth', 'transformation',
    'steady', 'supported', 'committed'
  ));

CREATE INDEX IF NOT EXISTS clients_service_type_idx ON public.clients(service_type);
