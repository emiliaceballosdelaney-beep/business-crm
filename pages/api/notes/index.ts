import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getNotes(req, res)
    case 'POST':
      return createNote(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/notes - Get all notes, optionally filtered by startup_id or tags
async function getNotes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, tag } = req.query

    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (startup_id && typeof startup_id === 'string') {
      query = query.eq('startup_id', startup_id)
    }

    if (tag && typeof tag === 'string') {
      query = query.contains('tags', [tag])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notes:', error)
      return res.status(500).json({ error: 'Failed to fetch notes' })
    }

    res.status(200).json({ notes: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/notes - Create a new note
async function createNote(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startup_id, content, tags } = req.body

    // Basic validation
    if (!startup_id || !content) {
      return res.status(400).json({
        error: 'Missing required fields: startup_id and content are required'
      })
    }

    // Validate tags array if provided
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' })
    }

    const noteData = {
      startup_id,
      content: content.trim(),
      tags: tags || null,
    }

    const { data, error } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return res.status(500).json({ error: 'Failed to create note' })
    }

    res.status(201).json({ note: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}