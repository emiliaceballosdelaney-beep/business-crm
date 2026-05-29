import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Note ID is required' })
  }

  switch (req.method) {
    case 'GET':
      return getNote(req, res, id)
    case 'PUT':
      return updateNote(req, res, id)
    case 'DELETE':
      return deleteNote(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/notes/[id] - Get a specific note by ID
async function getNote(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Note not found' })
      }
      console.error('Error fetching note:', error)
      return res.status(500).json({ error: 'Failed to fetch note' })
    }

    res.status(200).json({ note: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/notes/[id] - Update a specific note
async function updateNote(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { content, tags } = req.body

    // Build update object with only provided fields
    const updateData: any = {}

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' })
      }
      updateData.content = content.trim()
    }

    if (tags !== undefined) {
      if (tags && !Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array' })
      }
      updateData.tags = tags || null
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' })
    }

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Note not found' })
      }
      console.error('Error updating note:', error)
      return res.status(500).json({ error: 'Failed to update note' })
    }

    res.status(200).json({ note: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/notes/[id] - Delete a specific note
async function deleteNote(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting note:', error)
      return res.status(500).json({ error: 'Failed to delete note' })
    }

    res.status(200).json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}