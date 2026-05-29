-- phase16: add source_calendar to meetings
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS source_calendar TEXT;
