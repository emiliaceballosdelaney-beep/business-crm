import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { PROSPER_STARTUP_ID } from '../../../lib/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Milestone ID is required' })
  }

  switch (req.method) {
    case 'GET':
      return getMilestone(req, res, id)
    case 'PUT':
      return updateMilestone(req, res, id)
    case 'DELETE':
      return deleteMilestone(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/milestones/[id] - Get a specific milestone by ID
async function getMilestone(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Milestone not found' })
      }
      console.error('Error fetching milestone:', error)
      return res.status(500).json({ error: 'Failed to fetch milestone' })
    }

    res.status(200).json({ milestone: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/milestones/[id] - Update a specific milestone
async function updateMilestone(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, description, target_date, status, completed_at } = req.body

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

    if (target_date !== undefined) {
      if (target_date && isNaN(Date.parse(target_date))) {
        return res.status(400).json({ error: 'Invalid target_date format' })
      }
      updateData.target_date = target_date ? new Date(target_date).toISOString() : null
    }

    if (status !== undefined) {
      updateData.status = status

      // Auto-set completed_at when marking as completed
      if (status === 'completed' && !completed_at) {
        updateData.completed_at = new Date().toISOString()
      } else if (status !== 'completed') {
        updateData.completed_at = null
      }
    }

    if (completed_at !== undefined) {
      if (completed_at && isNaN(Date.parse(completed_at))) {
        return res.status(400).json({ error: 'Invalid completed_at format' })
      }
      updateData.completed_at = completed_at ? new Date(completed_at).toISOString() : null
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' })
    }

    const { data, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Milestone not found' })
      }
      console.error('Error updating milestone:', error)
      return res.status(500).json({ error: 'Failed to update milestone' })
    }

    res.status(200).json({ milestone: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/milestones/[id] - Delete a specific milestone
async function deleteMilestone(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)

    if (error) {
      console.error('Error deleting milestone:', error)
      return res.status(500).json({ error: 'Failed to delete milestone' })
    }

    res.status(200).json({ message: 'Milestone deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}