-- Phase 13: Drop NOT NULL on clients.user_id
-- This column predates tracked migrations and was used by an auth scaffold
-- that was never implemented. The CRM is single-user with no auth; user_id
-- is never set by any form or API route. Making it nullable unblocks Add Client.
ALTER TABLE clients ALTER COLUMN user_id DROP NOT NULL;
