import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { PROSPER_STARTUP_ID } from '../../../lib/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Meeting ID is required' })
  }

  switch (req.method) {
    case 'GET':
      return getMeeting(req, res, id)
    case 'PUT':
      return updateMeeting(req, res, id)
    case 'DELETE':
      return deleteMeeting(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/meetings/[id] - Get a specific meeting by ID
async function getMeeting(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Meeting not found' })
      }
      console.error('Error fetching meeting:', error)
      return res.status(500).json({ error: 'Failed to fetch meeting' })
    }

    res.status(200).json({ meeting: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/meetings/[id] - Update a specific meeting
async function updateMeeting(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, date, notes, attendees } = req.body

    // Build update object with only provided fields
    const updateData: any = {}

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' })
      }
      updateData.title = title.trim()
    }

    if (date !== undefined) {
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({ error: 'Invalid date format' })
      }
      updateData.date = new Date(date).toISOString()
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null
    }

    if (attendees !== undefined) {
      if (attendees && !Array.isArray(attendees)) {
        return res.status(400).json({ error: 'Attendees must be an array' })
      }
      updateData.attendees = attendees || null
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' })
    }

    const { data, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Meeting not found' })
      }
      console.error('Error updating meeting:', error)
      return res.status(500).json({ error: 'Failed to update meeting' })
    }

    res.status(200).json({ meeting: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/meetings/[id] - Delete a specific meeting
async function deleteMeeting(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)

    if (error) {
      console.error('Error deleting meeting:', error)
      return res.status(500).json({ error: 'Failed to delete meeting' })
    }

    res.status(200).json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}