-- Missing tables for Startup Tracker
-- Run these CREATE TABLE statements in your Supabase SQL editor

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    attendees TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS tasks_startup_id_idx ON public.tasks(startup_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);

CREATE INDEX IF NOT EXISTS milestones_startup_id_idx ON public.milestones(startup_id);
CREATE INDEX IF NOT EXISTS milestones_status_idx ON public.milestones(status);
CREATE INDEX IF NOT EXISTS milestones_target_date_idx ON public.milestones(target_date);

CREATE INDEX IF NOT EXISTS meetings_startup_id_idx ON public.meetings(startup_id);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON public.meetings(date);

CREATE INDEX IF NOT EXISTS notes_startup_id_idx ON public.notes(startup_id);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON public.notes USING GIN (tags);

-- Basic RLS policies (you may want to customize these based on your auth setup)
-- For now, allow all operations (you can restrict later when you add authentication)

CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on milestones" ON public.milestones FOR ALL USING (true);
CREATE POLICY "Allow all operations on meetings" ON public.meetings FOR ALL USING (true);
CREATE POLICY "Allow all operations on notes" ON public.notes FOR ALL USING (true);