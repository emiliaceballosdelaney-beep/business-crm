import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { PROSPER_STARTUP_ID } from '../../../lib/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID is required' })
  }

  switch (req.method) {
    case 'GET':
      return getTask(req, res, id)
    case 'PUT':
      return updateTask(req, res, id)
    case 'DELETE':
      return deleteTask(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/tasks/[id] - Get a specific task by ID
async function getTask(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' })
      }
      console.error('Error fetching task:', error)
      return res.status(500).json({ error: 'Failed to fetch task' })
    }

    res.status(200).json({ task: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/tasks/[id] - Update a specific task
async function updateTask(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, description, status, priority, due_date } = req.body

    // Build update object with only provided fields
    const updateData: any = {}

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' })
      }
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (status !== undefined) {
      updateData.status = status
    }

    if (priority !== undefined) {
      updateData.priority = priority
    }

    if (due_date !== undefined) {
      if (due_date && isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: 'Invalid due_date format' })
      }
      updateData.due_date = due_date ? new Date(due_date).toISOString() : null
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' })
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' })
      }
      console.error('Error updating task:', error)
      return res.status(500).json({ error: 'Failed to update task' })
    }

    res.status(200).json({ task: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
async function deleteTask(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)

    if (error) {
      console.error('Error deleting task:', error)
      return res.status(500).json({ error: 'Failed to delete task' })
    }

    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}