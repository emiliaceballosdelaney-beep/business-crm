-- Phase 9: Add end_date and notes to clients table
-- source column already exists (added in phase3-prosper.sql)

ALTER TABLE clients ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
