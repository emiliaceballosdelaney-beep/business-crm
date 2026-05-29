import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getMeetings(req, res)
    case 'POST':
      return createMeeting(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/meetings - Get all meetings, optionally filtered by startup_id
async function getMeetings(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id } = req.query

    let query = supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false })

    if (startup_id && typeof startup_id === 'string') {
      query = query.eq('startup_id', startup_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching meetings:', error)
      return res.status(500).json({ error: 'Failed to fetch meetings' })
    }

    res.status(200).json({ meetings: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/meetings - Create a new meeting
async function createMeeting(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, title, date, notes, attendees } = req.body

    // Basic validation
    if (!startup_id || !title || !date) {
      return res.status(400).json({
        error: 'Missing required fields: startup_id, title, and date are required'
      })
    }

    // Validate date
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Invalid date format' })
    }

    // Validate attendees array if provided
    if (attendees && !Array.isArray(attendees)) {
      return res.status(400).json({ error: 'Attendees must be an array' })
    }

    const meetingData = {
      startup_id,
      title: title.trim(),
      date: new Date(date).toISOString(),
      notes: notes?.trim() || null,
      attendees: attendees || null,
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select()
      .single()

    if (error) {
      console.error('Error creating meeting:', error)
      return res.status(500).json({ error: 'Failed to create meeting' })
    }

    res.status(201).json({ meeting: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}