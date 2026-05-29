import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getMilestones(req, res)
    case 'POST':
      return createMilestone(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/milestones - Get all milestones, optionally filtered by startup_id
async function getMilestones(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, status } = req.query

    let query = supabase
      .from('milestones')
      .select('*')
      .order('target_date', { ascending: true, nullsFirst: false })

    if (startup_id && typeof startup_id === 'string') {
      query = query.eq('startup_id', startup_id)
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching milestones:', error)
      return res.status(500).json({ error: 'Failed to fetch milestones' })
    }

    res.status(200).json({ milestones: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/milestones - Create a new milestone
async function createMilestone(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, title, description, target_date, status } = req.body

    // Basic validation
    if (!startup_id || !title) {
      return res.status(400).json({
        error: 'Missing required fields: startup_id and title are required'
      })
    }

    // Validate target_date if provided
    if (target_date && isNaN(Date.parse(target_date))) {
      return res.status(400).json({ error: 'Invalid target_date format' })
    }

    const milestoneData = {
      startup_id,
      title: title.trim(),
      description: description?.trim() || null,
      target_date: target_date ? new Date(target_date).toISOString() : null,
      status: status || 'pending',
      completed_at: null,
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert(milestoneData)
      .select()
      .single()

    if (error) {
      console.error('Error creating milestone:', error)
      return res.status(500).json({ error: 'Failed to create milestone' })
    }

    res.status(201).json({ milestone: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}