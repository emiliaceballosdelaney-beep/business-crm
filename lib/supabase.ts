import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types matching your actual schema
export interface Startup {
  id: string
  name: string
  stage: string
  one_liner: string | null
  description: string | null
  goals: string | null
  website: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  startup_id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  due_date: string | null
  created_at: string
}

export interface Milestone {
  id: string
  startup_id: string
  title: string
  description: string | null
  target_date: string | null
  completed_at: string | null
  status: string
  created_at: string
}

export interface Meeting {
  id: string
  startup_id: string
  title: string
  date: string
  notes: string | null
  attendees: string[] | null
  created_at: string
}

export interface Note {
  id: string
  startup_id: string
  content: string
  tags: string[] | null
  created_at: string
}

export interface Client {
  id: string
  startup_id: string
  name: string
  email: string | null
  status: string | null
  notes: string | null
  created_at: string
}
