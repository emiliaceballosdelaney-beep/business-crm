import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getTasks(req, res)
    case 'POST':
      return createTask(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/tasks - Get all tasks, optionally filtered by startup_id
async function getTasks(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, status, priority } = req.query

    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (startup_id && typeof startup_id === 'string') {
      query = query.eq('startup_id', startup_id)
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    if (priority && typeof priority === 'string') {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return res.status(500).json({ error: 'Failed to fetch tasks' })
    }

    res.status(200).json({ tasks: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/tasks - Create a new task
async function createTask(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, title, description, status, priority, due_date } = req.body

    // Basic validation
    if (!startup_id || !title) {
      return res.status(400).json({
        error: 'Missing required fields: startup_id and title are required'
      })
    }

    // Validate due_date if provided
    if (due_date && isNaN(Date.parse(due_date))) {
      return res.status(400).json({ error: 'Invalid due_date format' })
    }

    const taskData = {
      startup_id,
      title: title.trim(),
      description: description?.trim() || null,
      status: status || 'pending',
      priority: priority || null,
      due_date: due_date ? new Date(due_date).toISOString() : null,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return res.status(500).json({ error: 'Failed to create task' })
    }

    res.status(201).json({ task: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}