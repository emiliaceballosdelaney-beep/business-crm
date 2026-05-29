-- Phase 10: Link interactions to meetings for auto-logging deduplication

ALTER TABLE interactions ADD COLUMN IF NOT EXISTS meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL;

-- One auto-logged interaction per meeting (nulls are excluded so manual interactions are unaffected)
CREATE UNIQUE INDEX IF NOT EXISTS interactions_meeting_id_unique
  ON interactions (meeting_id)
  WHERE meeting_id IS NOT NULL;
