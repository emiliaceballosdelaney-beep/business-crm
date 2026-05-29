-- Phase 14: Email automation engine
-- Apply in Supabase SQL editor

-- 1. Queue table — one row per scheduled send
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id       UUID NOT NULL,
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workflow_key     TEXT NOT NULL,
  step_key         TEXT NOT NULL,
  template_key     TEXT NOT NULL,
  send_at          TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending', -- pending|sent|cancelled|failed
  cancelled_reason TEXT,
  sent_at          TIMESTAMPTZ,
  resend_id        TEXT,
  error            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_due    ON scheduled_emails(status, send_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_client ON scheduled_emails(client_id, workflow_key, status);

-- 2. Sent-email log — permanent history
CREATE TABLE IF NOT EXISTS email_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    UUID NOT NULL,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_key  TEXT NOT NULL,
  subject       TEXT NOT NULL,
  to_email      TEXT NOT NULL,
  resend_id     TEXT,
  status        TEXT NOT NULL DEFAULT 'sent', -- sent|delivered|opened|bounced|complained
  opened_at     TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_client ON email_log(client_id, sent_at DESC);

-- 3. Intake form magic links
CREATE TABLE IF NOT EXISTS intake_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Intake form responses
CREATE TABLE IF NOT EXISTS intake_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  responses    JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Unsubscribe flag on clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
