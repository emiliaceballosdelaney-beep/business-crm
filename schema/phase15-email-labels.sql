-- CRM tags for Gmail messages (stored in CRM, not Gmail)
CREATE TABLE IF NOT EXISTS email_labels (
  message_id TEXT        PRIMARY KEY,
  labels     TEXT[]      NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
