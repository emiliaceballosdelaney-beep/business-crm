-- Add meeting_url column so meetings can store a Zoom/Meet/Calendly link
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS meeting_url TEXT;
